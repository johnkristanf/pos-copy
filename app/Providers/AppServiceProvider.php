<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use ImageKit\ImageKit;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        config(['app.timezone' => 'Asia/Manila']);
        date_default_timezone_set('Asia/Manila');

        Model::preventLazyLoading(app()->isLocal());
        Model::shouldBeStrict(app()->isLocal());

        Storage::extend('imagekit', function ($config) {
            new ImageKit(
                $config['public_key'],
                $config['private_key'],
                $config['endpoint_url']
            );

            // 2. Create the Adapter
            // NOTE: You MUST have a Flysystem Adapter for ImageKit.
            // If you don't have one, you cannot use Storage::disk('imagekit').
            // Common packages: 'yammer/flysystem-imagekit', 'innova24/flysystem-imagekit'
            // Example below assumes you have an adapter class:

            // $adapter = new \Your\Namespace\ImageKitAdapter($client);

            // If you DO NOT have an adapter, you cannot use the 'imagekit' driver with Storage::put().
            // You should use the ImageKit SDK directly in your controller instead.

            // For now, to stop the crash, we can return a generic Local adapter
            // or throw a clearer error if the adapter is missing.

            throw new \Exception('You need to install a Flysystem Adapter for ImageKit to use it as a Storage disk.');
            // return new FilesystemAdapter(
            //    new Filesystem($adapter, $config),
            //    $adapter,
            //    $config
            // );
        });
    }
}
