<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'user_id' => $this->resource->user_id,
            'actions' => $this->formatActions($this->resource->actions),
            'seen_by' => $this->resource->seen_by,
            'seen_at' => $this->resource->seen_at,
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
        ];
    }

    private function formatActions(?array $actions): array
    {
        if (! $actions) {
            return [];
        }

        return array_map(function (string $action): string {
            $commaPosition = strpos($action, ', ');

            return $commaPosition !== false
            ? substr($action, $commaPosition + 2)
            : $action;
        }, $actions);
    }
}
