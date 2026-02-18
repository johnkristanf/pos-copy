<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateItemData extends Data
{
    public function __construct(
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
            'description' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:255'],

            'image_url' => ['nullable', 'string'],
            'blob_attachment_id' => ['nullable', 'integer', 'exists:blob_attachments,id'],

            'category_id' => ['required', 'exists:item_categories,id'],
            'supplier_id' => ['required', 'exists:suppliers,id'],

            'min_quantity' => ['required', 'numeric', 'min:0'],
            'max_quantity' => ['required', 'numeric', 'min:0'],

            'conversion_units' => ['array', 'sometimes'],
            'conversion_units.*.purchase_uom_id' => ['required_with:conversion_units', 'exists:unit_of_measures,id'],
            'conversion_units.*.base_uom_id' => ['required_with:conversion_units', 'exists:unit_of_measures,id'],
            'conversion_units.*.conversion_factor' => ['required_with:conversion_units', 'numeric', 'min:0.0000001'],

            'components_blueprint' => ['array', 'sometimes'],
            'components_blueprint.*.child_item_id' => ['required_with:components_blueprint', 'exists:items,id'],
            'components_blueprint.*.quantity' => ['required_with:components_blueprint', 'numeric', 'min:0.0000001'],
        ];
    }
}
