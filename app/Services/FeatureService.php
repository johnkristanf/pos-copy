<?php

namespace App\Services;

use App\Models\Features;
use Illuminate\Support\Collection;

class FeatureService
{
    public function getFeaturesWithPermissionNames(): Collection
    {
        return Features::query()
            ->with('permissions:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (Features $feature) => [
                'id' => $feature->id,
                'name' => $feature->name,
                'permissions' => $feature->permissions->pluck('name')->toArray(),
            ]);
    }
}
