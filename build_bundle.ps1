# build_bundle.ps1
$ErrorActionPreference = "Stop"

$rootDir = $PSScriptRoot
$jsDir = Join-Path $rootDir "js"

$files = @(
  "supabase.js",
  "api.js",
  "auth.js",
  "utilities.js",
  "rooms.js",
  "tenants.js",
  "requests.js",
  "maintenance.js",
  "parcels.js",
  "announcements.js",
  "reports.js",
  "settings.js",
  "dashboard.js",
  "app.js"
)

$bundleContent = "/* Bundled Tanakrit Dormitory Application - Standalone & File:// Compatible */`n"
$bundleContent += "(function() {`n`"use strict`";`n`n"

foreach ($file in $files) {
    $filePath = Join-Path $jsDir $file
    if (-not (Test-Path $filePath)) {
        Write-Warning "Missing file: $filePath"
        continue
    }

    $code = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    # Strip imports
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*import\s+[^;]+;\s*`$", "")

    # Strip export keywords
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*export\s+const\s+", "const ")
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*export\s+let\s+", "let ")
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*export\s+function\s+", "function ")
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*export\s+async\s+function\s+", "async function ")
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*export\s+class\s+", "class ")
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*export\s*\{[^}]*\};?\s*`$", "")
    $code = [System.Text.RegularExpressions.Regex]::Replace($code, "(?m)^\s*export\s+default\s+", "const defaultExport = ")

    $bundleContent += "`n/* ========== js/$file ========== */`n" + $code + "`n"
}

$bundleContent += "`n})();`n"

$outPath = Join-Path $jsDir "bundle.js"
[System.IO.File]::WriteAllText($outPath, $bundleContent, [System.Text.Encoding]::UTF8)
Write-Host "Successfully bundled to js/bundle.js, size: $($bundleContent.Length)"
