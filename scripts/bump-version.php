<?php

$lastCommitMessage = trim(shell_exec('git log -1 --pretty=%B 2>NUL') ?? '');

if (strpos($lastCommitMessage, '[skip ci]') !== false || strpos($lastCommitMessage, 'Bump version') !== false) {
    echo '⚠️  Detected a version bump commit. Skipping to prevent infinite loop.'.PHP_EOL;
    exit(0);
}

$packageJsonPath = __DIR__.'/../package.json';
$composerJsonPath = __DIR__.'/../composer.json';

function json_encode_pretty($data, $indentation = 4)
{
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($indentation === 2) {
        return preg_replace_callback('/^ +/m', function ($m) {
            return str_repeat(' ', strlen($m[0]) / 2);
        }, $json);
    }

    return $json;
}

if (! file_exists($packageJsonPath)) {
    echo '⚠️  Error: package.json not found.'.PHP_EOL;
    exit(1);
}

$packageContent = file_get_contents($packageJsonPath);
$packageData = json_decode($packageContent, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo '❌ Error: Invalid JSON in package.json'.PHP_EOL;
    exit(1);
}

$currentVersion = $packageData['version'] ?? '1.0.0';
$parts = explode('.', $currentVersion);
while (count($parts) < 3) {
    $parts[] = 0;
}

$parts[count($parts) - 1]++;
$newVersion = implode('.', $parts);

echo "📦 Bumping version: $currentVersion → $newVersion".PHP_EOL;

$packageData['version'] = $newVersion;
file_put_contents($packageJsonPath, json_encode_pretty($packageData, 2).PHP_EOL);
echo '✅ Updated package.json'.PHP_EOL;

if (file_exists($composerJsonPath)) {
    $composerContent = file_get_contents($composerJsonPath);
    $composerData = json_decode($composerContent, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        $composerData['version'] = $newVersion;
        file_put_contents($composerJsonPath, json_encode_pretty($composerData, 4).PHP_EOL);
        echo '✅ Updated composer.json'.PHP_EOL;
    }
}

// REMOVED: Do not commit here - let the post-commit hook handle it
echo '✅ Version files updated. Ready for commit.'.PHP_EOL;
exit(0);
