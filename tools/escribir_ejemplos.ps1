# ReviewPro - escribe en ejemplos/ los seis archivos de prueba del Bloque 3.
# Los genera la propia app (js/samples.js) en un navegador sin ventana y aqui se
# guardan byte por byte, asi que son identicos a los del boton "Cargar los
# archivos de prueba".
#   Uso:  powershell -ExecutionPolicy Bypass -File tools\escribir_ejemplos.ps1

$root = Split-Path $PSScriptRoot -Parent
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
# the folder name has a space: the file URL encodes it, or the browser reads two targets
$page = ((Join-Path $root 'tools\make_samples.html') -replace '\\', '/') -replace ' ', '%20'
$prof = Join-Path $env:TEMP 'reviewpro_samples_profile'
$dump = Join-Path $env:TEMP 'reviewpro_samples_dom.html'
$edgeArgs = @('--headless=new', '--disable-gpu', '--allow-file-access-from-files', "--user-data-dir=$prof", '--virtual-time-budget=4000', '--dump-dom', "file:///$page")
$p = Start-Process -FilePath $edge -ArgumentList $edgeArgs -Wait -PassThru -WindowStyle Hidden -RedirectStandardOutput $dump
$html = [IO.File]::ReadAllText($dump)
$out = Join-Path $root 'ejemplos'
New-Item -ItemType Directory -Force $out | Out-Null
$n = 0
foreach ($m in [regex]::Matches($html, '<pre data-name="([^"]+)">([^<]+)</pre>')) {
  $bytes = [Convert]::FromBase64String($m.Groups[2].Value)
  [IO.File]::WriteAllBytes((Join-Path $out $m.Groups[1].Value), $bytes)
  Write-Host ("  " + $m.Groups[1].Value + "  (" + $bytes.Length + " bytes)")
  $n++
}
Write-Host "$n archivos escritos en $out"
