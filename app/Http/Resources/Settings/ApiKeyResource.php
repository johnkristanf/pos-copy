<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiKeyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $featuresWithPermissions = $this->resource->features->unique('id')->map(function ($feature) {
            $permissionsForFeature = $this->resource->permissions
                ->filter(fn ($p) => $p->pivot->feature_id === $feature->id)
                ->pluck('name')
                ->values()
                ->toArray();

            return [
                'id' => $feature->id,
                'permissions' => $permissionsForFeature,
            ];
        })->filter(fn ($f) => ! empty($f['permissions']))->values()->toArray();

        return [
            'id' => $this->resource->id,
            'type' => $this->resource->type,
            'label' => $this->resource->label,
            'api_key' => $this->resource->key,
            'status' => $this->resource->isactive,
            'expiration_label' => $this->resource->key_expiration?->name ?? 'N/A',
            'expiration_date' => $this->resource->expires_at?->toDateTimeString(),
            'created_at' => $this->resource->created_at->toDateTimeString(),
            'updated_at' => $this->resource->updated_at?->toDateTimeString(),
            'last_used_at' => $this->resource->last_used_at?->toDateTimeString(),
            'key_expiration_id' => $this->resource->key_expiration_id,
            'features' => $featuresWithPermissions,
            'app_id' => $this->resource->app_id,
            'app_name' => $this->resource->app?->name,
        ];
    }
}
