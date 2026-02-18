<?php

namespace App\Data\Items;

use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateItemData extends Data
{
    public function __construct(
        public string $item_unit_type,
        public string $description,
        public int $category_id,
        public int $supplier_id,
        public float $min_quantity,
        public float $max_quantity,
        public ?string $brand = null,
        public ?string $color = null,
        public ?string $size = null,
        public ?string $image_url = null,
        public ?int $blob_attachment_id = null,
        public ?float $unit_price = null,
        /** @var array<int, array>|null */
        public ?array $conversion_units = null,
        /** @var array<int, array>|null */
        public ?array $components_blueprint = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'item_unit_type' => ['required', 'string', 'max:255', 'in:set,not_set'],
            'description' => [
                'required',
                'string',
                'max:255',
                Rule::unique('items')->where(fn ($query) => $query
                    ->where('brand', request('brand'))
                    ->where('color', request('color'))
                    ->where('size', request('size'))
                    ->where('category_id', request('category_id'))
                    ->where('supplier_id', request('supplier_id'))
                    ->whereNull('deleted_at')),
            ],
            'brand' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:255'],

            'image_url' => ['nullable'],
            'blob_attachment_id' => ['nullable', 'string', 'exists:blob_attachments,id'],

            'category_id' => ['required', 'exists:item_categories,id'],
            'supplier_id' => ['required', 'exists:suppliers,id'],

            'min_quantity' => ['required', 'numeric', 'min:0'],
            'max_quantity' => ['required', 'numeric', 'min:0'],

            'conversion_units' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'array'],
            'conversion_units.*.purchase_uom_id' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'exists:unit_of_measures,id'],
            'conversion_units.*.base_uom_id' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'exists:unit_of_measures,id'],
            'conversion_units.*.conversion_factor' => ['required_if:item_unit_type,not_set', 'exclude_if:item_unit_type,set', 'numeric', 'min:0'],

            'components_blueprint' => ['required_if:item_unit_type,set', 'exclude_if:item_unit_type,not_set', 'array'],
            'components_blueprint.*.child_item_id' => ['required_if:item_unit_type,set', 'exclude_if:item_unit_type,not_set', 'exists:items,id'],
            'components_blueprint.*.quantity' => ['required_if:item_unit_type,set', 'exclude_if:item_unit_type,not_set', 'numeric', 'min:0'],
        ];
    }
}
