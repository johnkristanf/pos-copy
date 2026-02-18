<?php

namespace App\Http\Resources\Items;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GetDropdownDataResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'category' => $this->resource['category'],
            'location' => $this->resource['location'],
            'supplier' => $this->resource['supplier'],
            'unit_of_measures' => $this->resource['unit_of_measures'],
            'stockLocation' => $this->resource['stockLocation'],
        ];
    }
}
