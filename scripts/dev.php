/**
 *
 * # .----------------------------------------------------------------------.
 * # | _   _ ____ ___   ____  ____  ___ ____   ____ _____ ____   ___  ____  |
 * # || | | / ___|_ _| | __ )|  _ \|_ _|  _ \ / ___| ____|  _ \ / _ \/ ___| |
 * # || | | \___ \| |  |  _ \| |_) || || | | | |  _|  _| | |_) | | | \___ \ |
 * # || |_| |___) | |  | |_) |  _ < | || |_| | |_| | |___|  __/| |_| |___) ||
 * # | \___/|____/___| |____/|_| \_\___|____/ \____|_____|_|    \___/|____/ |
 * # '----------------------------------------------------------------------'
 *
 *
 * @Vustron
 * @since 1.0.0
 */
<?php

$envFile = file_get_contents(__DIR__.'/../.env');
preg_match('/^APP_URL=(.*)$/m', $envFile, $matches);
$appUrl = trim($matches[1] ?? '');

$parsedUrl = parse_url($appUrl);
$host = $parsedUrl['host'] ?? 'localhost';
$port = $parsedUrl['port'] ?? 8000;

$command = sprintf(
    'npx concurrently -c "#93c5fd,#c4b5fd,#fb7185,#fdba74,#a78bfa,#34d399" "php artisan serve --host=%s --port=%s" "npm run dev" "php artisan queue:listen --tries=1"',
    $host,
    $port
);

passthru('php '.__DIR__.'/check-deps.php', $status);
if ($status !== 0) {
    exit($status);
}

passthru('php '.__DIR__.'/check-version.php', $versionStatus);
if ($versionStatus !== 0) {
    echo "\n\033[31m-----------------------------------------------------------------\033[0m\n";
    echo "\033[31mGit Fetch and Git pull your local repository to match the latest version\033[0m\n";
    echo "\033[31m-----------------------------------------------------------------\033[0m\n";
    exit($versionStatus);
}

passthru($command);
