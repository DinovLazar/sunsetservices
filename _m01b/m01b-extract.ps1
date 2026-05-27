# Phase M.01b extraction + inventory.
# Extracts all Takeout ZIP parts (except the confirmed -057 duplicate) DIRECTLY from D: (read-only)
# into a merged tree on C:, then walks the tree and emits inventory JSON/CSV + summary.
$ErrorActionPreference = 'Continue'

$root = 'C:\sunset-photos'
$src  = 'D:\Sunset Shared Drive\MARKETING ZIP Filer'
$dest = Join-Path $root 'extracted'
$logs = Join-Path $root 'logs'
$quar = Join-Path $root 'quarantine'
New-Item -ItemType Directory -Force -Path $root,$dest,$logs,$quar | Out-Null
"M.01b/M.01c working area. NOT part of the SunSet-V2 repo. Source ZIPs remain on D:\ untouched." |
  Out-File (Join-Path $root 'README.txt') -Encoding utf8

$prog = Join-Path $logs '05-extraction-progress.txt'
$fail = Join-Path $logs '04-failed-zips.log'
"" | Out-File $prog -Encoding utf8
"" | Out-File $fail -Encoding utf8
# clear any stale completion marker
Remove-Item (Join-Path $logs 'ALL_DONE.txt') -ErrorAction SilentlyContinue
function P($s){ ("{0}  {1}" -f (Get-Date -Format 'HH:mm:ss'), $s) | Out-File -FilePath $prog -Append -Encoding utf8 }

P "=== M.01b extraction start ==="
P ("dest = {0}" -f $dest)

# Locate WinRAR
$winrar = @("$env:ProgramFiles\WinRAR\WinRAR.exe","${env:ProgramFiles(x86)}\WinRAR\WinRAR.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if ($winrar) { P "Extractor: WinRAR  ($winrar)" }
else { P "Extractor: .NET fallback (WinRAR not found)"; Add-Type -AssemblyName System.IO.Compression.FileSystem | Out-Null }

# ZIP list minus the confirmed duplicate
$dupe = 'takeout-20251025T163736Z-1-057 (1).zip'
$zips = Get-ChildItem -LiteralPath $src -Filter *.zip -File |
  Where-Object { $_.Name -ne $dupe } | Sort-Object Name
P ("ZIPs to extract: {0} (skipping confirmed duplicate {1})" -f $zips.Count, $dupe)

$i=0; $ok=0; $bad=0
foreach($z in $zips){
  $i++
  P ("[{0}/{1}] extracting {2}" -f $i,$zips.Count,$z.Name)
  try {
    if ($winrar){
      $argline = 'x -y -ibck -o+ "{0}" {1}\' -f $z.FullName, $dest
      $p = Start-Process -FilePath $winrar -ArgumentList $argline -Wait -PassThru -WindowStyle Hidden
      if ($p.ExitCode -le 1){ $ok++ }
      else { $bad++; ("FAIL rc={0}: {1}" -f $p.ExitCode, $z.Name) | Out-File $fail -Append -Encoding utf8 }
    } else {
      [System.IO.Compression.ZipFile]::ExtractToDirectory($z.FullName, $dest)
      $ok++
    }
  } catch {
    $bad++
    ("EXCEPTION: {0} :: {1}" -f $z.Name, $_.Exception.Message) | Out-File $fail -Append -Encoding utf8
  }
}
P ("Extraction complete. ok={0} bad={1}" -f $ok,$bad)

# Manifest discovery
P "Searching for Takeout manifest..."
$man = Get-ChildItem -LiteralPath $dest -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match '^(archive_browser\.(html|txt)|index\.html)$' } | Select-Object -First 10
if ($man){ $man | ForEach-Object { P ("manifest: {0}  ({1} bytes)" -f $_.FullName, $_.Length) } }
else { P "manifest: none found" }

# Full file walk
P "Walking extracted tree..."
$files = Get-ChildItem -LiteralPath $dest -Recurse -File -ErrorAction SilentlyContinue
$totBytes = ($files | Measure-Object -Property Length -Sum).Sum
P ("Total files (all types): {0}  Total bytes: {1}" -f $files.Count, $totBytes)

# Media classification
$photoExt = @('.jpg','.jpeg','.png','.heic','.heif','.webp','.tiff','.tif','.bmp','.gif')
$rawExt   = @('.cr2','.cr3','.nef','.arw','.dng','.raf','.orf','.rw2')
$videoExt = @('.mp4','.mov','.avi','.mkv','.m4v','.3gp','.hevc')
$allMedia = $photoExt + $rawExt + $videoExt
$media = $files | Where-Object { $allMedia -contains $_.Extension.ToLower() }
P ("Media files: {0}" -f $media.Count)

# Full media CSV (for the record; not necessarily read whole)
$csv = Join-Path $logs '06-media-files.csv'
$media | Select-Object `
  @{n='Rel';e={ $_.FullName.Substring($dest.Length+1) }}, `
  @{n='Bytes';e={ $_.Length }}, `
  @{n='Mtime';e={ $_.LastWriteTime.ToString('yyyy-MM-dd') }}, `
  @{n='Ext';e={ $_.Extension.ToLower() }} |
  Export-Csv -Path $csv -NoTypeInformation -Encoding utf8

# Per-folder summary
$relOf = { param($p) $p.Substring($dest.Length+1) }
$folders = @()
foreach($g in ($media | Group-Object DirectoryName)){
  $grp = $g.Group | Sort-Object LastWriteTime
  $exts = @{}
  foreach($f in $grp){ $e=$f.Extension.ToLower(); if($exts.ContainsKey($e)){$exts[$e]++}else{$exts[$e]=1} }
  $ph = ($grp | Where-Object { $photoExt -contains $_.Extension.ToLower() }).Count
  $rw = ($grp | Where-Object { $rawExt   -contains $_.Extension.ToLower() }).Count
  $vd = ($grp | Where-Object { $videoExt -contains $_.Extension.ToLower() }).Count
  $bytes = ($grp | Measure-Object -Property Length -Sum).Sum
  $n = $grp.Count
  $samples = @()
  $idx = @(0, [int]($n/4), [int]($n/2), [int](3*$n/4), ($n-1)) | Select-Object -Unique
  foreach($k in $idx){ if($k -ge 0 -and $k -lt $n){ $samples += $grp[$k].Name } }
  $relFolder = if ($g.Name.Length -gt $dest.Length) { $g.Name.Substring($dest.Length+1) } else { '(root)' }
  $folders += [pscustomobject]@{
    folder   = $relFolder
    total    = $n
    photos   = $ph
    raw      = $rw
    video    = $vd
    bytes    = $bytes
    minDate  = $grp[0].LastWriteTime.ToString('yyyy-MM-dd')
    maxDate  = $grp[-1].LastWriteTime.ToString('yyyy-MM-dd')
    exts     = $exts
    samples  = $samples
  }
}
$folders = $folders | Sort-Object total -Descending
$folders | ConvertTo-Json -Depth 6 | Out-File (Join-Path $logs '07-folder-summary.json') -Encoding utf8

# Sitewide summary
$sum = Join-Path $logs '08-summary.txt'
"M.01b INVENTORY SUMMARY  $(Get-Date -Format o)" | Out-File $sum -Encoding utf8
("Extracted to: {0}" -f $dest) | Out-File $sum -Append -Encoding utf8
("ZIPs extracted ok: {0}   failed: {1}" -f $ok,$bad) | Out-File $sum -Append -Encoding utf8
("Total files (all types): {0}" -f $files.Count) | Out-File $sum -Append -Encoding utf8
("Total bytes (all types): {0}  ({1} GB)" -f $totBytes,[math]::Round($totBytes/1GB,2)) | Out-File $sum -Append -Encoding utf8
("Media files: {0}" -f $media.Count) | Out-File $sum -Append -Encoding utf8
$mp = ($media | Where-Object { $photoExt -contains $_.Extension.ToLower() }).Count
$mr = ($media | Where-Object { $rawExt   -contains $_.Extension.ToLower() }).Count
$mv = ($media | Where-Object { $videoExt -contains $_.Extension.ToLower() }).Count
("  photos: {0}   raw: {1}   video: {2}" -f $mp,$mr,$mv) | Out-File $sum -Append -Encoding utf8
$mbytes = ($media | Measure-Object -Property Length -Sum).Sum
("Media bytes: {0}  ({1} GB)" -f $mbytes,[math]::Round($mbytes/1GB,2)) | Out-File $sum -Append -Encoding utf8
"--- media count by extension ---" | Out-File $sum -Append -Encoding utf8
$media | Group-Object { $_.Extension.ToLower() } | Sort-Object Count -Descending |
  ForEach-Object { ("  {0}: {1}" -f $_.Name,$_.Count) | Out-File $sum -Append -Encoding utf8 }
"--- media by year (file mtime) ---" | Out-File $sum -Append -Encoding utf8
$media | Group-Object { $_.LastWriteTime.Year } | Sort-Object Name |
  ForEach-Object { ("  {0}: {1}" -f $_.Name,$_.Count) | Out-File $sum -Append -Encoding utf8 }
if ($media.Count -gt 0){
  $byDate = $media | Sort-Object LastWriteTime
  ("Earliest media: {0}  {1}" -f $byDate[0].LastWriteTime.ToString('yyyy-MM-dd'), (& $relOf $byDate[0].FullName)) | Out-File $sum -Append -Encoding utf8
  ("Latest media:   {0}  {1}" -f $byDate[-1].LastWriteTime.ToString('yyyy-MM-dd'), (& $relOf $byDate[-1].FullName)) | Out-File $sum -Append -Encoding utf8
}
"--- top 15 folders by media count ---" | Out-File $sum -Append -Encoding utf8
$folders | Select-Object -First 15 | ForEach-Object { ("  {0}  [{1}]  ({2} MB)" -f $_.folder,$_.total,[math]::Round($_.bytes/1MB,1)) | Out-File $sum -Append -Encoding utf8 }
"--- top 15 folders by bytes ---" | Out-File $sum -Append -Encoding utf8
$folders | Sort-Object bytes -Descending | Select-Object -First 15 | ForEach-Object { ("  {0}  ({1} MB)  [{2} files]" -f $_.folder,[math]::Round($_.bytes/1MB,1),$_.total) | Out-File $sum -Append -Encoding utf8 }
("Media folder count: {0}" -f $folders.Count) | Out-File $sum -Append -Encoding utf8

$cFree = (Get-PSDrive C).Free
("C: free after extraction: {0} GB" -f [math]::Round($cFree/1GB,2)) | Out-File $sum -Append -Encoding utf8

"ALL_DONE" | Out-File (Join-Path $logs 'ALL_DONE.txt') -Encoding utf8
P "ALL_DONE"
