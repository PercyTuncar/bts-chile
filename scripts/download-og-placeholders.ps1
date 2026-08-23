# Script para descargar placeholders de imagenes OG
# Ejecutar desde la raiz del proyecto

# Crear directorio si no existe
New-Item -ItemType Directory -Force -Path "public" | Out-Null

Write-Host "Descargando placeholders de imagenes OG..." -ForegroundColor Cyan

# OG Home (1200x630)
$ogHomeUrl = "https://placehold.co/1200x630/8b2fc9/ffffff?text=BTS+Chile+2026"
Invoke-WebRequest -Uri $ogHomeUrl -OutFile "public/og-home.jpg"
Write-Host "OK og-home.jpg descargado" -ForegroundColor Green

# OG Entradas (1200x630)
$ogEntradasUrl = "https://placehold.co/1200x630/8b2fc9/ffffff?text=Entradas+BTS+Chile+2026"
Invoke-WebRequest -Uri $ogEntradasUrl -OutFile "public/og-entradas.jpg"
Write-Host "OK og-entradas.jpg descargado" -ForegroundColor Green

# OG Noticias (1200x630)
$ogNoticiasUrl = "https://placehold.co/1200x630/8b2fc9/ffffff?text=Noticias+BTS+Chile"
Invoke-WebRequest -Uri $ogNoticiasUrl -OutFile "public/og-noticias.jpg"
Write-Host "OK og-noticias.jpg descargado" -ForegroundColor Green

# Logo 600x60 para Google News (PNG)
$logo600Url = "https://placehold.co/600x60/8b2fc9/ffffff?text=BTS+Chile"
Invoke-WebRequest -Uri $logo600Url -OutFile "public/logo-600x60.png"
Write-Host "OK logo-600x60.png descargado" -ForegroundColor Green

# Logo 512x512 (PNG)
$logo512Url = "https://placehold.co/512x512/8b2fc9/ffffff?text=BTS+Chile"
Invoke-WebRequest -Uri $logo512Url -OutFile "public/logo.png"
Write-Host "OK logo.png descargado" -ForegroundColor Green

Write-Host ""
Write-Host "Todos los placeholders descargados correctamente" -ForegroundColor Green
Write-Host "IMPORTANTE: Estos son placeholders temporales" -ForegroundColor Yellow
Write-Host "Reemplazalos con imagenes profesionales" -ForegroundColor Yellow
