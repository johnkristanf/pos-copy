<?php

namespace App\Services;

use App\Data\Integration\CreateAppData;
use App\Data\Integration\GetManyAppsData;
use App\Data\Integration\UpdateAppData;
use App\Models\Apps;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AppsService
{
    public function __construct(
        protected ApiKeyService $apiKeyService,
        protected NotificationService $notificationService
    ) {}

    public function getManyApps(GetManyAppsData $data): LengthAwarePaginator
    {
        $search = trim($data->search ?? '');
        $relations = [
            'api_keys' => function ($query) {
                $query->select('id', 'app_id', 'label', 'key', 'key_expiration_id', 'last_used_at', 'last_rolled_at', 'expires_at')
                    ->with([
                        'key_expiration:id,name,slug',
                        'features:id,tag,name',
                        'permissions:id,name',
                    ]);
            },
        ];

        $queryCallback = function ($query) use ($search, $relations, $data) {
            $query->with($relations)
                ->withCount('api_keys');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            $this->applyFilters($query, $data);
        };

        if ($search) {
            return Apps::search($search)
                ->query($queryCallback)
                ->paginate($data->per_page)
                ->withQueryString()
                ->through($this->transformApp(...));
        }

        $query = Apps::query();
        $queryCallback($query);

        return $query->latest('created_at')
            ->paginate($data->per_page)
            ->withQueryString()
            ->through($this->transformApp(...));
    }

    protected function applyFilters($query, GetManyAppsData $data): void
    {
        $query->when($data->date_from, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($data->date_to, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->when(! is_null($data->isactive), fn ($q) => $q->where('isactive', $data->isactive));
    }

    public function transformApp(Apps $app): array
    {
        return [
            'id' => $app->id,
            'slug' => $app->slug,
            'name' => $app->name,
            'isactive' => $app->isactive,
            'created_at' => $app->created_at?->toDateTimeString(),
            'updated_at' => $app->updated_at?->toDateTimeString(),
            'api_keys_count' => $app->api_keys_count ?? 0,
            'api_keys' => $app->relationLoaded('api_keys')
            ? $app->api_keys->map($this->transformApiKey(...))
            : [],
        ];
    }

    protected function transformApiKey($apiKey): array
    {
        return [
            'id' => $apiKey->id,
            'label' => $apiKey->label,
            'key' => $apiKey->key,
            'key_expiration_id' => $apiKey->key_expiration_id,
            'last_used_at' => $apiKey->last_used_at?->toDateTimeString(),
            'last_rolled_at' => $apiKey->last_rolled_at?->toDateTimeString(),
            'expires_at' => $apiKey->expires_at?->toDateTimeString(),
            'key_expiration' => $apiKey->key_expiration,
            'feature_permissions' => $this->apiKeyService->getFeaturePermission(
                $apiKey->features,
                $apiKey->permissions
            ),
        ];
    }

    public function createApp(CreateAppData $data): Apps
    {
        return DB::transaction(function () use ($data) {
            $app = Apps::create($data->toArray());

            $this->notificationService->notify('created new', ['project_management:read'], 'app', $app->name);

            return $app;
        });
    }

    public function updateApp(Apps $app, UpdateAppData $data): Apps
    {
        return DB::transaction(function () use ($app, $data) {
            $app->fill($data->toArray())->save();

            $this->notificationService->notify('updated', ['project_management:read'], 'app', $app->name);

            return $app->loadCount('api_keys');
        });
    }

    public function deleteApp(Apps $app): bool
    {
        return DB::transaction(function () use ($app) {
            $name = $app->name;
            $app->api_keys()->delete();
            $deleted = (bool) $app->forceDelete();

            if ($deleted) {
                $this->notificationService->notify('deleted', ['project_management:read'], 'app', $name);
            }

            return $deleted;
        });
    }
}
