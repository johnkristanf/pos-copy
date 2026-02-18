<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray($request): array
    {
        $causer = $this->resource->causer;

        $fullName = null;
        if ($causer) {
            $fullName = trim(\sprintf(
                '%s %s %s',
                $causer->getAttribute('first_name') ?? '',
                $causer->getAttribute('middle_name') ?? '',
                $causer->getAttribute('last_name') ?? ''
            ));

            if (empty($fullName)) {
                $fullName = $causer->getAttribute('email') ?? 'N/A';
            }
        }

        return [
            'id' => $this->resource->getAttribute('id'),
            'log_name' => $this->resource->getAttribute('log_name'),
            'description' => $this->resource->getAttribute('description'),
            'event' => $this->resource->getAttribute('event'),
            'properties' => $this->resource->getAttribute('properties'),
            'device_info' => $this->resource->getAttribute('device_info'),
            'device_type' => $this->resource->getAttribute('device_type'),
            'browser' => $this->resource->getAttribute('browser'),
            'platform' => $this->resource->getAttribute('platform'),
            'ip_address' => $this->resource->getAttribute('ip_address'),
            'created_at' => $this->resource->getAttribute('created_at')?->toDateTimeString(),
            'causer' => $causer ? [
                'id' => $causer->getKey(),
                'type' => $causer->getMorphClass(),
                'name' => $fullName,
            ] : null,
        ];
    }
}
