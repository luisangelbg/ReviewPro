# ReviewPro — validación independiente del Bloque 8 (modelo multinivel, meta-regresión,
# promedio dentro de estudios, recorte y relleno, conteo de votos).
#
# El modelo se reimplementa con MATRICES DENSAS completas (la app usa Sherman–Morrison
# por estudio) y se optimiza con optim(L-BFGS-B) con cota inferior 0 (la app usa
# Nelder–Mead sobre σ = θ²). Si ambos caminos coinciden, la verosimilitud y el
# optimizador de la app están bien.   Uso: Rscript tools/validar_bloque8.R

library(jsonlite)
set.seed(8)
m <- 14
k_i <- sample(1:4, m, replace = TRUE)
study <- rep(seq_len(m), k_i)
n <- length(study)
u <- rnorm(m, 0, sqrt(0.02))[study]
w <- rnorm(n, 0, sqrt(0.01))
v <- runif(n, 0.002, 0.03)
xnum <- round(runif(n, 5, 40), 1)                       # un moderador numérico (p. ej., P disponible)
xcat <- sample(c("consorcio", "nativo", "unica"), m, replace = TRUE)[study]
y <- 0.10 - 0.002 * (xnum - 20) + u + w + rnorm(n, 0, sqrt(v))
out <- list(data = list(y = y, v = v, study = study, xnum = xnum, xcat = xcat))

remlDense <- function(s2, X, three = TRUE) {
  s2b <- s2[1]; s2w <- if (three) s2[2] else 0
  V <- diag(v + s2w)
  for (i in seq_len(m)) { idx <- which(study == i); V[idx, idx] <- V[idx, idx] + s2b }
  Vi <- solve(V); XtVX <- t(X) %*% Vi %*% X
  beta <- solve(XtVX, t(X) %*% Vi %*% y)
  r <- y - X %*% beta
  ll <- -0.5 * (as.numeric(determinant(V)$modulus) + as.numeric(determinant(XtVX)$modulus) + as.numeric(t(r) %*% Vi %*% r) + (n - ncol(X)) * log(2 * pi))
  list(ll = ll, beta = as.numeric(beta), se = sqrt(diag(solve(XtVX))), vcov = solve(XtVX))
}
fitDense <- function(X, three = TRUE) {
  # sqrt-parametrization (s2 = t^2 reaches 0) and nlminb with a strict tolerance, from several starts
  f <- function(t) -remlDense(t^2, X, three)$ll
  starts <- if (three) list(c(0.1, 0.1), c(0.2, 0.03), c(0.03, 0.2)) else list(0.1, 0.2)
  best <- NULL
  for (st in starts) { o <- nlminb(st, f, control = list(rel.tol = 1e-15, x.tol = 1e-12, eval.max = 5000, iter.max = 3000)); if (is.null(best) || o$objective < best$objective) best <- o }
  s2 <- best$par^2
  r <- remlDense(s2, X, three)
  c(r, list(s2b = s2[1], s2w = if (three) s2[2] else 0))
}
X1 <- matrix(1, n, 1)
# the restricted log-likelihood at fixed values: compares the likelihood itself, whatever the optimizer
grid <- list(c(0.01, 0.01), c(0.05, 0.002), c(0.002, 0.04), c(0, 0.02), c(0.03, 0))
out$llgrid <- lapply(grid, function(s) list(s2b = s[1], s2w = s[2], ll = remlDense(s, X1, TRUE)$ll, beta = remlDense(s, X1, TRUE)$beta))
Xn0 <- cbind(1, xnum)
out$llgridX <- lapply(grid, function(s) list(s2b = s[1], s2w = s[2], ll = remlDense(s, Xn0, TRUE)$ll, beta = remlDense(s, Xn0, TRUE)$beta))
f3 <- fitDense(X1, TRUE); f2 <- fitDense(X1, FALSE)
out$ml3 <- f3[c("ll", "beta", "se", "s2b", "s2w")]
out$ml2 <- f2[c("ll", "beta", "se", "s2b", "s2w")]
out$lrt <- list(LR = 2 * (f3$ll - f2$ll), p = 0.5 * pchisq(2 * (f3$ll - f2$ll), 1, lower.tail = FALSE))

# meta-regresión con el moderador numérico y con el categórico
Xn <- cbind(1, xnum); fn <- fitDense(Xn, TRUE)
out$mregNum <- fn[c("ll", "beta", "se", "s2b", "s2w")]
lv <- sort(unique(xcat)); Xc <- cbind(1, sapply(lv[-1], function(l) as.numeric(xcat == l))); fc <- fitDense(Xc, TRUE)
b <- fc$beta[2:3]; Vb <- fc$vcov[2:3, 2:3]
out$mregCat <- c(fc[c("ll", "beta", "se", "s2b", "s2w")], list(QM = as.numeric(t(b) %*% solve(Vb) %*% b), levels = lv))

# promedio dentro de estudios con rho = 0.5
agg <- t(sapply(seq_len(m), function(i) { idx <- which(study == i); k <- length(idx); S <- outer(sqrt(v[idx]), sqrt(v[idx])) * 0.5; diag(S) <- v[idx]; c(mean(y[idx]), sum(S) / k^2) }))
out$agg <- list(y = agg[, 1], v = agg[, 2])

# REML de dos niveles sobre los promedios (para el recorte y relleno)
remlTau <- function(yy, vv) { f <- function(t2) { w <- 1 / (vv + t2); mu <- sum(w * yy) / sum(w); 0.5 * (sum(log(vv + t2)) + log(sum(w)) + sum(w * (yy - mu)^2)) }; t2 <- optimize(f, c(0, 5), tol = 1e-12)$minimum; w <- 1 / (vv + t2); c(tau2 = t2, est = sum(w * yy) / sum(w)) }

# recorte y relleno L0 (Duval y Tweedie 2000), escrito aparte
tf <- function(yy, vv, side) {
  s <- if (side == "left") 1 else -1; z <- s * yy; k <- length(z); ord <- order(z); k0 <- 0; prev <- -1; it <- 0
  while (k0 != prev && it < 100) {
    prev <- k0; keep <- ord[seq_len(k - k0)]
    th <- remlTau(z[keep], vv[keep])["est"]
    dev <- z - th; r <- rank(abs(dev)); Tn <- sum(r[dev > 0])
    k0 <- max(0, round((4 * Tn - k * (k + 1)) / (2 * k - 1))); it <- it + 1
  }
  filled <- if (k0 > 0) s * (2 * th - z[ord[(k - k0 + 1):k]]) else numeric(0)
  adj <- remlTau(c(yy, filled), c(vv, if (k0 > 0) vv[ord[(k - k0 + 1):k]] else numeric(0)))
  list(k0 = k0, est = unname(adj["est"]), theta = unname(s * th))
}
# un conjunto con sesgo: estudios pequeños solo si son positivos
set.seed(3)
se <- runif(60, 0.03, 0.35); yb <- 0.05 + rnorm(60, 0, se); keep <- se < 0.07 | yb / se > 1.96
yb <- yb[keep]; vb <- se[keep]^2
out$tf <- c(list(y = yb, v = vb), tf(yb, vb, "left"))

# prueba de signos
out$vote <- list(pos = 11, n = 15, p = binom.test(11, 15)$p.value)
out$vote2 <- list(pos = 3, n = 20, p = binom.test(3, 20)$p.value)

writeLines(c("/* Generated by tools/validar_bloque8.R — do not edit by hand. */",
  paste0("window.RREF_B8 = ", toJSON(out, digits = NA, auto_unbox = TRUE), ";")), "tests/r_reference_b8.js")
cat("3 niveles: s2b", f3$s2b, " s2w", f3$s2w, " beta", f3$beta, " ll", f3$ll, "\n")
cat("2 niveles: s2b", f2$s2b, " ll", f2$ll, "  LRT", out$lrt$LR, "\n")
cat("recorte y relleno: k0", out$tf$k0, " ajustado", out$tf$est, "\n")
