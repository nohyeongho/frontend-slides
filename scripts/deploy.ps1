<#
.SYNOPSIS
    HTML 프레젠테이션을 Vercel에 무료로 원클릭 배포하는 PowerShell 스크립트입니다.
.DESCRIPTION
    지정된 슬라이드 HTML 또는 폴더를 Vercel 배포용 디렉토리로 구성하여 배포합니다.
.PARAMETER PresentationPath
    배포할 HTML 파일 경로 또는 슬라이드 폴더 경로
.EXAMPLE
    .\scripts\deploy.ps1 -PresentationPath .\sample-deck.html
#>

param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$PresentationPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $PresentationPath)) {
    Write-Error "배포 대상 경로를 찾을 수 없습니다: $PresentationPath"
    exit 1
}

Write-Host "`n🚀 Vercel 배포 준비 중..." -ForegroundColor Cyan

# Vercel CLI 설치 여부 확인
try {
    $null = Get-Command npx -ErrorAction Stop
} catch {
    Write-Error "Node.js (npx)가 설치되어 있지 않습니다. https://nodejs.org 에서 설치해주세요."
    exit 1
}

# 배포 폴더 구성
$tempDeployDir = Join-Path $PSScriptRoot ".temp-deploy"
if (Test-Path $tempDeployDir) {
    Remove-Item -Recurse -Force $tempDeployDir
}
New-Item -ItemType Directory -Path $tempDeployDir | Out-Null

if ((Get-Item $PresentationPath).PSIsContainer) {
    # 폴더인 경우 전체 복사
    Copy-Item -Path "$PresentationPath\*" -Destination $tempDeployDir -Recurse -Force
} else {
    # 단일 HTML 파일인 경우 index.html로 복사하고 같은 폴더의 assets도 함께 복사
    $sourceDir = Split-Path -Parent $PresentationPath
    Copy-Item -Path $PresentationPath -Destination (Join-Path $tempDeployDir "index.html") -Force
    $assetsDir = Join-Path $sourceDir "assets"
    if (Test-Path $assetsDir) {
        Copy-Item -Path $assetsDir -Destination $tempDeployDir -Recurse -Force
    }
}

Write-Host "Vercel 배포를 실행합니다 (로그인이 안 되어 있다면 브라우저에서 로그인 창이 뜹니다)..." -ForegroundColor Yellow
npx vercel deploy --prod --yes $tempDeployDir

# 임시 폴더 정리
if (Test-Path $tempDeployDir) {
    Remove-Item -Recurse -Force $tempDeployDir
}

Write-Host "`n🎉 배포가 완료되었습니다!" -ForegroundColor Green
