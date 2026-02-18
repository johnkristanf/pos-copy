<?php

/**
 * check-deps.php
 *
 * Checks if the packages in vendor and node_modules match the versions
 * specified in the lock files (composer.lock and package-lock.json).
 *
 * Usage: php scripts/check-deps.php
 */
$red = "\033[31m";
$green = "\033[32m";
$yellow = "\033[33m";
$reset = "\033[0m";

$issuesFound = false;
$composerMissing = false;
$npmMissing = false;

echo "Checking project dependencies...\n\n";

// ---------------------------------------------------------
// 1. Check Composer (vendor)
// ---------------------------------------------------------
echo 'Checking Composer dependencies... ';

// 'composer install --dry-run' checks against composer.lock without making changes.
// It will output "Nothing to install, update or remove" if fully synced.
$composerOutput = [];
$composerExitCode = 0;
exec('composer install --dry-run 2>&1', $composerOutput, $composerExitCode);
$composerOutputStr = implode("\n", $composerOutput);

if (strpos($composerOutputStr, 'Nothing to install, update or remove') !== false) {
    echo "{$green}OK{$reset}\n";
} else {
    echo "{$red}MISMATCH{$reset}\n";
    $issuesFound = true;
    $composerMissing = true;
}

// ---------------------------------------------------------
// 2. Check NPM (node_modules)
// ---------------------------------------------------------
echo 'Checking NPM dependencies...      ';

// 'npm list --depth=0' is a standard way to verify if installed packages
// match the package-lock.json file. It exits with 1 if there are errors/missing deps.
$npmOutput = [];
$npmExitCode = 0;
exec('npm list --depth=0 2>&1', $npmOutput, $npmExitCode);

if ($npmExitCode === 0) {
    echo "{$green}OK{$reset}\n";
} else {
    echo "{$red}MISMATCH{$reset}\n";
    $issuesFound = true;
    $npmMissing = true;
}

// ---------------------------------------------------------
// 3. Prompt User
// ---------------------------------------------------------
if ($issuesFound) {
    echo "\n{$yellow}Dependency versions do not match the lock files.{$reset}\n";
    echo "Please run the following commands to sync your environment:\n\n";

    if ($composerMissing) {
        // 'composer install' syncs to the lock file. 'composer update' updates the lock file.
        echo "  {$red}> composer update{$reset} (or 'composer install' to sync to lock file)\n";
    }

    if ($npmMissing) {
        echo "  {$red}> npm install{$reset}\n";
    }

    echo "\n";
    exit(1); // Exit with error code to potentially stop build chains
}

echo "\n{$green}All dependencies are in sync.{$reset}\n";
exit(0);
