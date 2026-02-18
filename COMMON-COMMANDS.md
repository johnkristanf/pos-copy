**quick actions**

- php artisan wayfinder:generate
- php artisan wayfinder:generate --path=resources/js/wayfinder
- php artisan wayfinder:generate --skip-actions
- php artisan wayfinder:generate --skip-routes
- php artisan optimize
- php artisan migrate:fresh --seed
- php artisan serve --host=0.0.0.0 --port=8001

- composer update
- composer clear
- composer refresh
- composer restart(this will trigger: reseed, clear cache, regenerate routes from wayfinder, recreate cache, clear scout index, recreate scout index)

- bun build --compile --minify index.ts --outfile backup-cli
- $ git tag --delete 'tagname'
