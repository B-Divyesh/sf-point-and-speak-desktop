$ErrorActionPreference = "Stop"
$fixture = Join-Path ([IO.Path]::GetTempPath()) ("point-speak-installer-test-" + [Guid]::NewGuid())
$download = Join-Path $fixture "download"
New-Item -ItemType Directory -Path $fixture, $download | Out-Null
$artifactName = "Point.Speak.fixture-setup.exe"
$artifact = Join-Path $fixture $artifactName
[IO.File]::WriteAllText($artifact, "Point and Speak fixture")
$hash = (Get-FileHash $artifact -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content (Join-Path $fixture "SHA256SUMS") "$hash  $artifactName"
$release = @{ assets = @(
  @{ name = $artifactName; browser_download_url = "http://127.0.0.1:8765/$artifactName" },
  @{ name = "SHA256SUMS"; browser_download_url = "http://127.0.0.1:8765/SHA256SUMS" }
) } | ConvertTo-Json -Depth 4
Set-Content (Join-Path $fixture "release.json") $release
$server = Start-Process python -ArgumentList "-m", "http.server", "8765", "--bind", "127.0.0.1", "--directory", $fixture -PassThru -WindowStyle Hidden
try {
  Start-Sleep -Seconds 1
  $env:POINT_SPEAK_RELEASE_API = "http://127.0.0.1:8765/release.json"
  $env:POINT_SPEAK_TEST_ONLY = "1"
  $output = & "$PSScriptRoot/../public/install.ps1" 2>&1 | Out-String
  if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "Installer success fixture exited $LASTEXITCODE" }
  if ($output -notmatch "Verified SHA256") { throw "Installer did not report checksum verification" }

  Set-Content (Join-Path $fixture "SHA256SUMS") "$('0' * 64)  $artifactName"
  try {
    & "$PSScriptRoot/../public/install.ps1" | Out-Null
    throw "Tampered installer was accepted"
  } catch {
    if ($_.Exception.Message -notmatch "Checksum did not match") { throw }
  }
} finally {
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
  Remove-Item Env:POINT_SPEAK_RELEASE_API -ErrorAction SilentlyContinue
  Remove-Item Env:POINT_SPEAK_TEST_ONLY -ErrorAction SilentlyContinue
  Remove-Item $fixture -Recurse -Force -ErrorAction SilentlyContinue
}
