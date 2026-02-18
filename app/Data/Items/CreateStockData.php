<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateStockData extends Data
{
    public function __construct(
        public string $item_unit_type,
        public float $min_quantity,
        public float $max_quantity,
        public int $category_id,
        public int $supplier_id,
        public array $stock_locations_qty,
        public ?string $purchase_order_item_id = null,
        public ?int $item_id = null,
        public ?string $description = null,
        public ?string $brand = null,
        public ?string $color = null,
        public ?string $size = null,
        public ?string $image_url = null,
        public ?float $unit_price = null,
        public ?int $stock_in_uom_id = null,
        public ?array $conversion_units = null,
        public ?array $components_blueprint = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'purchase_order_item_id' => ['nullable', 'uuid'],
            'item_id' => ['nullable', 'exists:items,id'],
            'item_unit_type' => ['required', 'string', 'max:255', 'in:set,not_set'],
            'description' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'string'],

            'min_quantity' => ['required', 'numeric', 'min:0'],
            'max_quantity' => ['required', 'numeric', 'min:0'],

            'unit_price' => ['nullable', 'numeric', 'min:0'],

            'category_id' => ['required', 'exists:item_categories,id'],
            'supplier_id' => ['required', 'exists:suppliers,id'],

            'stock_in_uom_id' => ['nullable', 'exists:unit_of_measures,id'],
            'stock_locations_qty' => ['required', 'array', 'min:1'],
            'stock_locations_qty.*.id' => ['required', 'exists:stock_locations,id'],
            'stock_locations_qty.*.quantity' => ['required', 'numeric', 'min:0'],

            'conversion_units' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'array'],
            'conversion_units.*.purchase_uom_id' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'exists:unit_of_measures,id'],
            'conversion_units.*.base_uom_id' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'exists:unit_of_measures,id'],
            'conversion_units.*.conversion_factor' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'numeric', 'min:0.0000001'],

            'components_blueprint' => ['required_if:item_unit_type,set', 'exclude_if:item_unit_type,not_set', 'array'],
            'components_blueprint.*.child_item_id' => ['required_if:item_unit_type,set', 'exclude_if:item_unit_type,not_set', 'exists:items,id'],
            'components_blueprint.*.quantity' => ['required_if:item_unit_type,set', 'exclude_if:item_unit_type,not_set', 'numeric', 'min:0.0000001'],
        ];
    }
}
