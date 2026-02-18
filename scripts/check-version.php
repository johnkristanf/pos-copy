<?php

$composerPath = __DIR__.'/../composer.json';
$packagePath = __DIR__.'/../package.json';

$red = "\033[31m";
$green = "\033[32m";
$yellow = "\033[33m";
$reset = "\033[0m";

echo "Checking version consistency...\n\n";

if (! file_exists($packagePath)) {
    echo "{$red}Error: package.json not found.{$reset}\n";
    exit(1);
}

$packageJson = json_decode(file_get_contents($packagePath), true);
$packageVersion = $packageJson['version'] ?? null;

if (! $packageVersion) {
    echo "{$red}Error: No version found in package.json.{$reset}\n";
    exit(1);
}

echo "package.json version: {$yellow}{$packageVersion}{$reset}\n";

if (! file_exists($composerPath)) {
    echo "{$red}Error: composer.json not found.{$reset}\n";
    exit(1);
}

$composerJson = json_decode(file_get_contents($composerPath), true);
$composerVersion = $composerJson['version'] ?? null;

if (! $composerVersion) {
    echo "{$yellow}Warning: No version found in composer.json. Skipping comparison for this file.{$reset}\n";
} else {
    echo "composer.json version: {$yellow}{$composerVersion}{$reset}\n";
}

$gitVersion = trim(shell_exec('git describe --tags --abbrev=0 2>&1'));

if (empty($gitVersion) || strpos($gitVersion, 'fatal') !== false) {
    echo "{$red}Error: Could not retrieve version from git tags. Make sure you have created a tag.{$reset}\n";
    exit(1);
}

$normalizedGitVersion = ltrim($gitVersion, 'v');

echo "Repository tag:       {$yellow}{$gitVersion}{$reset} (Normalized: {$normalizedGitVersion})\n";

echo "\n--------------------------------------------------\n";

$hasError = false;

if ($packageVersion !== $normalizedGitVersion) {
    echo "{$red}MISMATCH: package.json ({$packageVersion}) does not match Git tag ({$normalizedGitVersion}){$reset}\n";
    $hasError = true;
} else {
    echo "{$green}MATCH: package.json matches Git tag.{$reset}\n";
}

if ($composerVersion) {
    if ($composerVersion !== $normalizedGitVersion) {
        echo "{$red}MISMATCH: composer.json ({$composerVersion}) does not match Git tag ({$normalizedGitVersion}){$reset}\n";
        $hasError = true;
    } else {
        echo "{$green}MATCH: composer.json matches Git tag.{$reset}\n";
    }
}

if ($composerVersion && $composerVersion !== $packageVersion) {
    echo "{$red}MISMATCH: composer.json ({$composerVersion}) does not match package.json ({$packageVersion}){$reset}\n";
    $hasError = true;
}

echo "\n";

if ($hasError) {
    echo "{$red}❌ Version check failed.{$reset}\n";
    exit(1);
} else {
    echo "{$green}✅ Version check passed. All versions match.{$reset}\n";
    exit(0);
}
