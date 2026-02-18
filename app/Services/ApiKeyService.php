<?php

namespace App\Services;

use App\Data\ApiKeys\CreateApiKeyData;
use App\Data\ApiKeys\DeleteApiKeyData;
use App\Data\ApiKeys\UpdateApiKeyData;
use App\Http\Resources\Settings\ApiKeyResource;
use App\Http\Resources\Settings\GetFeaturePermissionResource;
use App\Models\ApiKeys;
use App\Models\KeyExpirationOption;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiKeyService
{
    public function __construct(
        private readonly FeatureService $featureService,
        private readonly PermissionsService $permissionsService,
        private readonly NotificationService $notificationService
    ) {}

    public function getManyApiKeys(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $search = trim($filters['search'] ?? '');

        $relations = [
            'app:id,name,slug',
            'key_expiration:id,name,slug',
            'features',
            'permissions',
        ];

        $queryCallback = function ($query) use ($search, $relations, $filters) {
            $query->with($relations);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('label', 'like', "%{$search}%")
                        ->orWhere('key', 'like', "%{$search}%")
                        ->orWhereHas('app', fn ($aq) => $aq->where('name', 'like', "%{$search}%"));
                });
            }

            $this->applyFilters($query, $filters);
        };

        if ($search) {
            return ApiKeys::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString()
                ->through(fn ($apiKey) => ApiKeyResource::make($apiKey)->resolve());
        }

        $query = ApiKeys::query();
        $queryCallback($query);

        return $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn ($apiKey) => ApiKeyResource::make($apiKey)->resolve());
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['date_from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->when($filters['app_id'] ?? null, fn ($q, $id) => $q->where('app_id', $id))
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when($filters['key_expiration_id'] ?? null, fn ($q, $id) => $q->where('key_expiration_id', $id));
    }

    public function getKeyExpirationOptions(): Collection
    {
        return KeyExpirationOption::query()
            ->orderBy('id')
            ->get(['id', 'name', 'slug'])
            ->map(fn ($option) => [
                'value' => (string) $option->id,
                'label' => $option->name,
                'slug' => $option->slug,
            ]);
    }

    public function generateApiKey(): string
    {
        $environment = app()->environment('production') ? 'live' : 'test';

        return 'bsk_'.$environment.'_'.Str::random(40);
    }

    public function createApiKey(CreateApiKeyData $data, string $appId): ApiKeys
    {
        return DB::transaction(function () use ($data, $appId) {
            $key = ($data->type === 'inbound')
            ? $this->generateApiKey()
            : ($data->key ?? $this->generateApiKey());

            $apiKey = ApiKeys::create([
                'type' => $data->type,
                'label' => $data->label,
                'key' => $key,
                'app_id' => $appId,
                'key_expiration_id' => $data->key_expiration_id,
                'expires_at' => $this->getKeyExpirationDate($data->key_expiration_id),
            ]);

            if (! empty($data->features)) {
                $this->syncApiKeyFeaturePermissions($data->features, $apiKey->id);
            }

            $this->notificationService->notify('created new', ['api_key_management:read'], 'API key', $apiKey->label);

            return $apiKey->load(['app', 'key_expiration', 'features', 'permissions']);
        });
    }

    public function updateApiKey(ApiKeys $apiKey, UpdateApiKeyData $data): ApiKeys
    {
        return DB::transaction(function () use ($apiKey, $data) {
            $updateData = [
                'label' => $data->label,
                'key_expiration_id' => $data->key_expiration_id,
            ];

            if ($data->key_expiration_id != $apiKey->key_expiration_id) {
                $updateData['expires_at'] = $this->getKeyExpirationDate($data->key_expiration_id);
            }

            $apiKey->fill($updateData)->save();

            if ($data->features !== null) {
                DB::table('api_key_feature_permissions')->where('api_key_id', $apiKey->id)->delete();
                if (! empty($data->features)) {
                    $this->syncApiKeyFeaturePermissions($data->features, $apiKey->id);
                }
            }

            $this->notificationService->notify('updated', ['api_key_management:read'], 'API key', $apiKey->label);

            return $apiKey->fresh(['app', 'key_expiration', 'features', 'permissions']);
        });
    }

    public function deleteApiKey(DeleteApiKeyData $data): bool
    {
        return DB::transaction(function () use ($data) {
            $label = $data->apiKey->label;

            DB::table('api_key_feature_permissions')->where('api_key_id', $data->apiKey->id)->delete();

            $deleted = $data->apiKey->delete();

            if ($deleted) {
                $this->notificationService->notify('deleted', ['api_key_management:read'], 'API key', $label);
            }

            return $deleted;
        });
    }

    protected function getKeyExpirationDate(int|string $id): ?Carbon
    {
        $option = KeyExpirationOption::query()->find($id);
        if (! $option || $option->slug === 'no_expiration') {
            return null;
        }

        return match ($option->slug) {
            '1_day' => now()->addDay(),
            '7_days' => now()->addDays(7),
            '30_days' => now()->addDays(30),
            '90_days' => now()->addDays(90),
            '1_year' => now()->addYear(),
            default => null,
        };
    }

    public function syncApiKeyFeaturePermissions(array $features, int $apiKeyId): void
    {
        $permissions = $this->permissionsService->getPermissionsKeyedByName();

        $inserts = collect($features)->flatMap(fn ($featureData) => collect($featureData->permissions)->map(function ($permissionName) use ($apiKeyId, $featureData, $permissions) {
            $p = $permissions->get($permissionName);

            return $p ? [
                'api_key_id' => $apiKeyId,
                'feature_id' => $featureData->id,
                'permission_id' => $p->id,
            ] : null;
        })->filter())->toArray();

        if (! empty($inserts)) {
            DB::table('api_key_feature_permissions')->insert($inserts);
        }
    }

    public function getAvailableFeatures(): Collection
    {
        return $this->featureService->getFeaturesWithPermissionNames();
    }

    public function getFeaturePermission($featureCollection, $permissionCollection): AnonymousResourceCollection
    {
        $data = $featureCollection->unique('id')->map(function ($feature) use ($permissionCollection) {
            $permissions = $permissionCollection
                ->filter(fn ($permission) => $permission->pivot->feature_id == $feature->getAttribute('id'))
                ->pluck('name')
                ->unique()
                ->values()
                ->toArray();

            return [
                'feature' => $feature,
                'permissions' => $permissions,
            ];
        })->values();

        return GetFeaturePermissionResource::collection($data);
    }
}
