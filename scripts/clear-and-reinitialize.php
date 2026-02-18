<?php

use Illuminate\Support\Facades\Artisan;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function runCommand($command, $parameters = [])
{
    echo "\n\033[1;33mRunning: $command\033[0m\n";

    $exitCode = Artisan::call($command, $parameters);

    echo Artisan::output();

    if ($exitCode !== 0) {
        echo "\033[1;31mCommand failed: $command\033[0m\n";
        exit($exitCode);
    }
}

runCommand('migrate:fresh', ['--seed' => true]);
runCommand('wayfinder:generate', ['--with-form' => true]);
runCommand('route:clear', ['--ansi' => true]);
runCommand('config:clear', ['--ansi' => true]);
runCommand('cache:clear', ['--ansi' => true]);
runCommand('view:clear', ['--ansi' => true]);
runCommand('optimize', ['--ansi' => true]);

$searchableModels = [
    App\Models\User::class,
    App\Models\ApiKeys::class,
    App\Models\ActivityLog::class,
    App\Models\Features::class,
    App\Models\Items::class,
    App\Models\Customers::class,
    App\Models\Suppliers::class,
    App\Models\UnitOfMeasure::class,
    App\Models\ReturnFromCustomer::class,
];

foreach ($searchableModels as $model) {
    runCommand('scout:flush', ['model' => $model]);
    runCommand('scout:import', ['model' => $model]);
}

echo "\n\033[1;32m✓ System cleared and re-initialized successfully.\033[0m\n";
