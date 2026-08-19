<#
.SYNOPSIS
    HTML 슬라이드를 PDF로 내보내는 PowerShell 래퍼 스크립트입니다.
.DESCRIPTION
    Playwright Node.js 스크립트를 호출하여 1920x1080 고해상도 PDF를 생성합니다.
.PARAMETER HtmlPath
    변환할 HTML 프레젠테이션 파일 경로
.PARAMETER OutputPdf
    (선택) 저장할 PDF 파일 경로
.PARAMETER Compact
    (선택) 1280x720 컴팩트 모드로 변환 (용량 절감)
.EXAMPLE
    .\scripts\export-pdf.ps1 -HtmlPath .\sample-deck.html
#>

param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$HtmlPath,

    [Parameter(Mandatory=$false, Position=1)]
    [string]$OutputPdf = "",

    [switch]$Compact
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $HtmlPath)) {
    Write-Error "HTML 파일을 찾을 수 없습니다: $HtmlPath"
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScript = Join-Path $scriptDir "export-pdf.js"

$cmdArgs = @($nodeScript, $HtmlPath)
if ($OutputPdf) {
    $cmdArgs += $OutputPdf
}
if ($Compact) {
    $cmdArgs += "--compact"
}

Write-Host "PDF 변환을 시작합니다..." -ForegroundColor Cyan
node @cmdArgs
