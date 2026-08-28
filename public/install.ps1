$ErrorActionPreference = "Stop"
$repo = "B-Divyesh/sf-point-and-speak-desktop"
$api = if ($env:POINT_SPEAK_RELEASE_API) { $env:POINT_SPEAK_RELEASE_API } else { "https://api.github.com/repos/$repo/releases/latest" }
$release = Invoke-RestMethod $api
$installer = $release.assets | Where-Object { $_.name -match "(\.msi$|-setup\.exe$)" } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq "SHA256SUMS" } | Select-Object -First 1
if (-not $installer -or -not $sums) { throw "Windows download is still being published." }
$tempDir = Join-Path ([IO.Path]::GetTempPath()) ("point-speak-" + [Guid]::NewGuid())
New-Item -ItemType Directory -Path $tempDir | Out-Null
try {
  $msi = Join-Path $tempDir $installer.name
  $sumFile = Join-Path $tempDir "SHA256SUMS"
  Invoke-WebRequest $installer.browser_download_url -OutFile $msi
  Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile
  $line = Get-Content $sumFile | Where-Object { $_ -match [regex]::Escape($installer.name) } | Select-Object -First 1
  $expected = ($line -split "\s+")[0].ToLowerInvariant()
  $actual = (Get-FileHash $msi -Algorithm SHA256).Hash.ToLowerInvariant()
  if (-not $expected -or $expected -ne $actual) { throw "Checksum did not match. Nothing was installed." }
  if ($env:POINT_SPEAK_TEST_ONLY -eq "1") {
    Write-Host "Verified SHA256 for the Point & Speak installer. Test mode did not open it."
  } elseif ($installer.name -match "\.msi$") {
    Start-Process msiexec.exe -ArgumentList "/i `"$msi`"" -Wait
  } else {
    Start-Process $msi -Wait
  }
  Write-Host "Verified SHA256 and opened the Point & Speak installer."
} finally { Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue }
