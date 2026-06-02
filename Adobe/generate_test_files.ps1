# Script de PowerShell para generar archivos de prueba para el Método Miclos
# Coloca un video vertical cualquiera de pocos segundos en la raíz y renombralo como "template.mp4"

$templateFile = "template.mp4"

if (-not (Test-Path $templateFile)) {
    Write-Host "----------------------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "ADVERTENCIA: No se encontrò el archivo '$templateFile'." -ForegroundColor Yellow
    Write-Host "Para generar los archivos de prueba, por favor:" -ForegroundColor Yellow
    Write-Host "1. Toma cualquier video corto vertical (.mp4) de tu computadora." -ForegroundColor White
    Write-Host "2. Còpialo en esta carpeta y renombralo como 'template.mp4'." -ForegroundColor White
    Write-Host "3. Vuelve a ejecutar este script." -ForegroundColor White
    Write-Host "----------------------------------------------------------------------" -ForegroundColor Yellow
    Exit
}

Write-Host "Generando archivos de prueba usando '$templateFile'..." -ForegroundColor Green

# 1. Generar 80 HOOKs
Write-Host "Generando 80 HOOKs en '01_HOOKS'..."
for ($i = 1; $i -le 80; $i++) {
    $num = $i.ToString("000")
    $dest = "01_HOOKS\HOOK_$($num)_EDITADO.mp4"
    Copy-Item $templateFile -Destination $dest -Force
}

# 2. Generar 3 MIDs
Write-Host "Generando 3 MIDs en '02_MIDS'..."
for ($i = 1; $i -le 3; $i++) {
    $dest = "02_MIDS\MID_$($i)_EDITADO.mp4"
    Copy-Item $templateFile -Destination $dest -Force
}

# 3. Generar 3 CTAs
Write-Host "Generando 3 CTAs en '03_CTAS'..."
for ($i = 1; $i -le 3; $i++) {
    $dest = "03_CTAS\CTA_$($i)_EDITADO.mp4"
    Copy-Item $templateFile -Destination $dest -Force
}

Write-Host "¡Proceso terminado! Se crearon los archivos en las carpetas de prueba." -ForegroundColor Green
