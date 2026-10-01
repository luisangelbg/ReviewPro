# ReviewPro — validación independiente del Bloque 1.
#
# Reimplementa en R, sin paquetes de meta-análisis y por un camino distinto al
# de la app, todo lo que calculan los motores del Bloque 1, y escribe los
# valores de referencia en tests/r_reference_b1.js para que la página de
# pruebas los compare con el motor de JavaScript.
#
#   * REML y ML se obtienen maximizando la log-verosimilitud con optimize(),
#     no con la iteración de punto fijo que usa la app.
#   * Paule–Mandel se resuelve con uniroot(), no con bisección.
#   * Las distribuciones vienen de las funciones de R (pt, qt, pchisq...).
#   * TF-IDF y Bayes ingenuo se calculan con matrices densas.
#
# Uso:  Rscript tools/validar_bloque1.R   (desde la carpeta ReviewPro)

library(jsonlite)

out <- list()

# ------------------------------------------------------------------
# 1. Distribuciones
# ------------------------------------------------------------------
tq <- c(-3.2, -1.5, 0.3, 2.1, 4.7)
dfs <- c(1, 3, 12, 40)
out$pt <- lapply(dfs, function(d) pt(tq, d))
out$qt <- lapply(dfs, function(d) qt(c(0.025, 0.1, 0.9, 0.975, 0.999), d))
out$pnorm <- pnorm(c(-8, -3.5, -1.96, 0, 0.7, 2.5, 6))
out$qnorm <- qnorm(c(1e-10, 0.001, 0.025, 0.3, 0.5, 0.8, 0.975, 0.9999))
out$pchisq_upper <- lapply(c(1, 4, 12, 30), function(d) pchisq(c(0.2, 3, 9.5, 25, 60), d, lower.tail = FALSE))
out$lgamma <- lgamma(c(0.5, 1, 2.5, 10, 33.3, 150))

# ------------------------------------------------------------------
# 2. Tamaños de efecto
# ------------------------------------------------------------------
smd <- function(m1, s1, n1, m2, s2, n2) {
  m <- n1 + n2 - 2
  sp <- sqrt(((n1 - 1) * s1^2 + (n2 - 1) * s2^2) / m)
  J <- exp(lgamma(m / 2) - 0.5 * log(m / 2) - lgamma((m - 1) / 2))
  g <- J * (m1 - m2) / sp
  c(yi = g, vi = 1 / n1 + 1 / n2 + g^2 / (2 * (n1 + n2)), J = J)
}
out$smd <- as.list(smd(24.1, 5.2, 12, 20.3, 4.8, 15))
out$smd_small <- as.list(smd(3.4, 1.1, 4, 2.9, 0.9, 5))
rom <- function(m1, s1, n1, m2, s2, n2) c(yi = log(m1 / m2), vi = s1^2 / (n1 * m1^2) + s2^2 / (n2 * m2^2))
out$rom <- as.list(rom(7.8, 1.2, 6, 6.5, 1.1, 6))
out$zcor <- list(yi = atanh(0.42), vi = 1 / (58 - 3))
out$or_zero <- {
  a <- 0 + .5; b <- 20 + .5; c <- 4 + .5; d <- 16 + .5
  list(yi = log(a * d / (b * c)), vi = 1 / a + 1 / b + 1 / c + 1 / d)
}

# ------------------------------------------------------------------
# 3. Meta-análisis: datos BCG (Colditz et al. 1994), log razón de riesgos
# ------------------------------------------------------------------
tpos <- c(4, 6, 3, 62, 33, 180, 8, 505, 29, 17, 186, 5, 27)
tneg <- c(119, 300, 228, 13536, 5036, 1361, 2537, 87886, 7470, 1699, 50448, 2493, 16886)
cpos <- c(11, 29, 11, 248, 47, 372, 10, 499, 45, 65, 141, 3, 29)
cneg <- c(128, 274, 209, 12619, 5761, 1079, 619, 87892, 7232, 1600, 27197, 2338, 17825)
yi <- log((tpos / (tpos + tneg)) / (cpos / (cpos + cneg)))
vi <- 1 / tpos - 1 / (tpos + tneg) + 1 / cpos - 1 / (cpos + cneg)
k <- length(yi)
out$bcg <- list(tpos = tpos, tneg = tneg, cpos = cpos, cneg = cneg, yi = yi, vi = vi)

wmean <- function(t2) { w <- 1 / (vi + t2); sum(w * yi) / sum(w) }
Qgen <- function(t2) { w <- 1 / (vi + t2); mu <- sum(w * yi) / sum(w); sum(w * (yi - mu)^2) }

# DL
w0 <- 1 / vi
Q <- Qgen(0)
tau2_DL <- max(0, (Q - (k - 1)) / (sum(w0) - sum(w0^2) / sum(w0)))
# HE
tau2_HE <- max(0, var(yi) - mean(vi))
# PM
tau2_PM <- if (Qgen(0) <= k - 1) 0 else uniroot(function(t) Qgen(t) - (k - 1), c(0, 10), tol = 1e-14)$root
# ML y REML por maximización directa de la log-verosimilitud
llML <- function(t2) { w <- 1 / (vi + t2); mu <- sum(w * yi) / sum(w); -0.5 * sum(log(vi + t2)) - 0.5 * sum(w * (yi - mu)^2) }
llREML <- function(t2) { w <- 1 / (vi + t2); llML(t2) - 0.5 * log(sum(w)) }
tau2_ML <- optimize(llML, c(0, 5), maximum = TRUE, tol = 1e-13)$maximum
tau2_REML <- optimize(llREML, c(0, 5), maximum = TRUE, tol = 1e-13)$maximum

fit <- function(t2, knha = FALSE) {
  w <- 1 / (vi + t2); W <- sum(w)
  est <- sum(w * yi) / W
  if (knha) {
    qk <- sum(w * (yi - est)^2) / (k - 1)
    se <- sqrt(qk / W); crit <- qt(0.975, k - 1); p <- 2 * pt(-abs(est / se), k - 1)
  } else {
    se <- sqrt(1 / W); crit <- qnorm(0.975); p <- 2 * pnorm(-abs(est / se))
  }
  s2 <- (k - 1) * sum(w0) / (sum(w0)^2 - sum(w0^2))
  pi <- est + c(-1, 1) * qt(0.975, k - 2) * sqrt(t2 + se^2)
  list(tau2 = t2, est = est, se = se, ci = est + c(-1, 1) * crit * se, p = p,
       I2 = t2 / (t2 + s2), H2 = (t2 + s2) / s2, pi = pi)
}
out$bcg_fit <- list(
  Q = Q, pQ = pchisq(Q, k - 1, lower.tail = FALSE),
  FE = { w <- w0; est <- sum(w * yi) / sum(w); se <- sqrt(1 / sum(w));
         list(est = est, se = se, ci = est + c(-1, 1) * qnorm(0.975) * se, I2 = max(0, (Q - (k - 1)) / Q), H2 = Q / (k - 1)) },
  DL = fit(tau2_DL), HE = fit(tau2_HE), PM = fit(tau2_PM), ML = fit(tau2_ML), REML = fit(tau2_REML),
  REML_KH = fit(tau2_REML, knha = TRUE)
)

# Egger: regresión de y/se sobre 1/se
se <- sqrt(vi)
eg <- summary(lm(I(yi / se) ~ I(1 / se)))$coefficients
out$bcg_egger <- list(intercept = eg[1, 1], seInt = eg[1, 2], t = eg[1, 3], p = eg[1, 4], slope = eg[2, 1])
# Begg: tau de Kendall entre efectos estandarizados y varianzas
mu_fe <- sum(w0 * yi) / sum(w0)
ts <- (yi - mu_fe) / sqrt(vi - 1 / sum(w0))
S <- 0
for (i in 1:(k - 1)) for (j in (i + 1):k) S <- S + sign(ts[i] - ts[j]) * sign(vi[i] - vi[j])
z <- S / sqrt(k * (k - 1) * (2 * k + 5) / 18)
out$bcg_begg <- list(S = S, tau = S / (k * (k - 1) / 2), z = z, p = 2 * pnorm(-abs(z)))

# Un segundo conjunto, homogéneo (τ² estimado en 0 por DL): la frontera
yh <- c(0.10, 0.12, 0.08, 0.11, 0.09); vh <- c(0.010, 0.012, 0.009, 0.015, 0.011)
wh <- 1 / vh; Qh <- sum(wh * (yh - sum(wh * yh) / sum(wh))^2)
out$homog <- list(yi = yh, vi = vh, Q = Qh,
  tau2_DL = max(0, (Qh - 4) / (sum(wh) - sum(wh^2) / sum(wh))),
  est = sum(wh * yh) / sum(wh))

# ------------------------------------------------------------------
# 4. TF-IDF y Bayes ingenuo multinomial sobre un corpus ya tokenizado
# ------------------------------------------------------------------
docs <- list(
  c("maize", "yield", "mycorrhiza", "inoculation", "field"),
  c("maize", "yield", "nitrogen", "fertilizer", "field", "field"),
  c("tomato", "mycorrhiza", "greenhouse", "inoculation"),
  c("biochar", "soil", "carbon"),
  c("maize", "mycorrhiza", "inoculation", "yield", "yield")
)
lab <- c(1, 0, 0, 0, 1)
terms <- sort(unique(unlist(docs)))
N <- length(docs)
tf <- t(sapply(docs, function(d) sapply(terms, function(t) sum(d == t))))
dfreq <- colSums(tf > 0)
idf <- log((1 + N) / (1 + dfreq)) + 1
X <- tf * matrix(idf, N, length(terms), byrow = TRUE)
X <- X / sqrt(rowSums(X^2))
alpha <- 1
V <- length(terms)
c1 <- colSums(X[lab == 1, , drop = FALSE]); c0 <- colSums(X[lab == 0, , drop = FALSE])
wNB <- (log(c1 + alpha) - log(sum(c1) + alpha * V)) - (log(c0 + alpha) - log(sum(c0) + alpha * V))
newdoc <- c("maize", "inoculation", "greenhouse")
xn <- sapply(terms, function(t) sum(newdoc == t)) * idf
xn <- xn / sqrt(sum(xn^2))
out$nb <- list(docs = docs, labels = lab, terms = terms, idf = unname(idf), X = unname(X),
  weights = unname(wNB), newdoc = newdoc, score_new = sum(xn * wNB), scores = unname(as.vector(X %*% wNB)))

# ------------------------------------------------------------------
# 5. Métricas de cribado sobre un orden conocido
# ------------------------------------------------------------------
ord <- c(1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0)  # etiquetas en el orden leído
Nn <- length(ord); R <- sum(ord); found <- c(0, cumsum(ord))
nAt <- function(level) min(which(found >= ceiling(level * R - 1e-9))) - 1
out$metrics <- list(order_labels = ord,
  n95 = nAt(0.95), wss95 = (Nn - nAt(0.95)) / Nn - 0.05,
  n80 = nAt(0.80), wss80 = (Nn - nAt(0.80)) / Nn - 0.20,
  rrf10 = found[round(0.10 * Nn) + 1] / R, rrf25 = found[round(0.25 * Nn) + 1] / R,
  atd = mean(which(ord == 1)) / Nn)

dir.create("tests", showWarnings = FALSE)
writeLines(c("/* Generated by tools/validar_bloque1.R — do not edit by hand. */",
  paste0("window.RREF_B1 = ", toJSON(out, digits = NA, auto_unbox = TRUE), ";")), "tests/r_reference_b1.js")
cat("BCG tau2: DL", tau2_DL, " REML", tau2_REML, " PM", tau2_PM, " ML", tau2_ML, " HE", tau2_HE, "\n")
cat("BCG RE(DL) est", out$bcg_fit$DL$est, " se", out$bcg_fit$DL$se, "  RE(REML) est", out$bcg_fit$REML$est, " se", out$bcg_fit$REML$se, "\n")
cat("BCG FE est", out$bcg_fit$FE$est, " Q", Q, " I2(DL)", out$bcg_fit$DL$I2, "\n")
cat("Escrito tests/r_reference_b1.js\n")
