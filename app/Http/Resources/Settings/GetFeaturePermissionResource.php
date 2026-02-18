<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GetFeaturePermissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'features' => [
                'id' => $this->resource['feature']->getAttribute('id'),
                'tag' => $this->resource['feature']->getAttribute('tag'),
                'name' => $this->resource['feature']->getAttribute('name'),
            ],
            'permissions' => $this->resource['permissions'],
        ];
    }
}
