# Captura de pantalla de la app para el manual: abre index.html (file://) en un navegador sin ventana,
# ejecuta una receta (recetas/<nombre>.js, precedida de recetas/_comun.js) y guarda manual/img/<nombre>.png
# al doble de resolución.
# Uso (desde la carpeta de la app):
#   powershell -ExecutionPolicy Bypass -File manual\herramientas\captura.ps1 -Receta b2-marco [-Ancho 1400] [-Alto 900]
#     [-Tema light|dark] [-Idioma es|en] [-Recorte "x,y,ancho,alto"] [-Salida nombre]
# La receta es el cuerpo de una función asíncrona: usa las herramientas de _comun.js y termina con
# «return foto(nodos)» (o caja(...)) para que la captura se recorte a lo que la figura necesita.
param(
  [Parameter(Mandatory = $true)][string]$Receta,
  [int]$Ancho = 1400, [int]$Alto = 900,
  [string]$Tema = 'light', [string]$Idioma = 'es',
  [string]$Recorte = '', [string]$Salida = ''
)
$ErrorActionPreference = 'Stop'
$man = Split-Path $PSScriptRoot -Parent
$app = Split-Path $man -Parent
$dir = Join-Path $PSScriptRoot 'recetas'
if (-not $Salida) { $Salida = $Receta }
$png = Join-Path $man "img\$Salida.png"
$ret = Join-Path $env:TEMP 'reviewpro-receta.txt'
$tmp = Join-Path $env:TEMP 'reviewpro-receta.js'
if (Test-Path $ret) { Remove-Item $ret }
$comun = [IO.File]::ReadAllText((Join-Path $dir '_comun.js'), [Text.Encoding]::UTF8)
$cuerpo = [IO.File]::ReadAllText((Join-Path $dir "$Receta.js"), [Text.Encoding]::UTF8)
[IO.File]::WriteAllText($tmp, "(async () => {`n$comun`n$cuerpo`n})()", (New-Object Text.UTF8Encoding $false))
& powershell -ExecutionPolicy Bypass -File (Join-Path $app 'tools\local\shot.ps1') -Out $png -SetupFile $tmp -SetupOut $ret -Theme $Tema -Lang $Idioma -Width $Ancho -Height $Alto -Scale 2 -Wait 2500 -SetupWait 700 | Out-Null
if (-not $Recorte -and (Test-Path $ret)) { $v = [string](Get-Content $ret -Raw); if ($v -and $v.Trim() -match '^\d+,\d+,\d+,\d+$') { $Recorte = $v.Trim() } else { Write-Output "receta devolvió: $v" } }
if ($Recorte) {
  Add-Type -AssemblyName System.Drawing
  $r = $Recorte.Split(',') | ForEach-Object { [int]([double]$_ * 2) }
  $img = [Drawing.Image]::FromFile($png)
  $bmp = New-Object Drawing.Bitmap $r[2], $r[3]
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img, (New-Object Drawing.Rectangle 0, 0, $r[2], $r[3]), (New-Object Drawing.Rectangle $r[0], $r[1], $r[2], $r[3]), [Drawing.GraphicsUnit]::Pixel)
  $img.Dispose(); $g.Dispose()
  $bmp.Save($png, [Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
Write-Output "img\$Salida.png $Recorte"
