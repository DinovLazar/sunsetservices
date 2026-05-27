# Phase M.01b pre-flight — READ-ONLY. Measures disk + ZIP sizes; hashes the -057 duplicate.
$ErrorActionPreference = 'Continue'
$out = Join-Path $PSScriptRoot 'preflight-out.txt'
function L($s){ $s | Out-File -FilePath $out -Append -Encoding utf8 }

"M.01b PREFLIGHT  $(Get-Date -Format o)" | Out-File -FilePath $out -Encoding utf8
L "=== C: drive (bytes) ==="
$c = Get-PSDrive C
L ("Used: {0}" -f $c.Used)
L ("Free: {0}" -f $c.Free)
L ("Free GB: {0}" -f [math]::Round($c.Free/1GB,2))

$src = 'D:\Sunset Shared Drive\MARKETING ZIP Filer'
L "=== Source: $src ==="
if (Test-Path -LiteralPath $src) {
  $zips = Get-ChildItem -LiteralPath $src -Filter *.zip -File
  L ("ZIP count: {0}" -f $zips.Count)
  $sum = ($zips | Measure-Object -Property Length -Sum).Sum
  L ("ZIP total bytes: {0}" -f $sum)
  L ("ZIP total GB: {0}" -f [math]::Round($sum/1GB,2))
  L "--- per file (name<TAB>bytes) ---"
  $zips | Sort-Object Name | ForEach-Object { L ("{0}`t{1}" -f $_.Name, $_.Length) }
  L "--- -057 duplicate SHA-256 ---"
  $a = Join-Path $src 'takeout-20251025T163736Z-1-057.zip'
  $b = Join-Path $src 'takeout-20251025T163736Z-1-057 (1).zip'
  if (Test-Path -LiteralPath $a) { L ("057      : " + (Get-FileHash -LiteralPath $a -Algorithm SHA256).Hash) } else { L "057      : MISSING" }
  if (Test-Path -LiteralPath $b) { L ("057 (1)  : " + (Get-FileHash -LiteralPath $b -Algorithm SHA256).Hash) } else { L "057 (1)  : MISSING" }
} else {
  L "SOURCE NOT FOUND"
}

L "=== 7-Zip present? ==="
$cand = @("$env:ProgramFiles\7-Zip\7z.exe", "${env:ProgramFiles(x86)}\7-Zip\7z.exe")
$sevenz = $cand | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($sevenz) { L ("7z: {0}" -f $sevenz) } else { L "7z: not found (will use Expand-Archive)" }

L "PREFLIGHT_DONE"
