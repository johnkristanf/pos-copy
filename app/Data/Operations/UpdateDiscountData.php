<?php

namespace App\Data\Operations;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateDiscountData extends Data
{
    public function __construct(
        public string $name,
        public string $discount_type,
        public float $amount,
        public string $item_category_type,
        public ?string $description = null,
        public ?int $min_purchase_qty = null,
        public ?float $min_spend = null,
        public ?float $capped_amount = null,
        public ?string $start_date = null,
        public ?string $start_time = null,
        public ?string $end_date = null,
        public ?string $end_time = null,
        /** @var array<int>|null */
        public ?array $category_ids = null,
        /** @var array<int>|null */
        public ?array $item_ids = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'discount_type' => ['required', 'string', 'in:percentage,amount'],
            'amount' => ['required', 'numeric', 'min:0'],
            'min_purchase_qty' => ['nullable', 'integer', 'min:1'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'capped_amount' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'start_time' => ['nullable', 'date_format:H:i:s'],
            'end_date' => ['nullable', 'date'],
            'end_time' => ['nullable', 'date_format:H:i:s'],
            'item_category_type' => ['required', 'string', 'in:select_item,select_category,all_item'],
            'category_ids' => ['required_if:item_category_type,select_category', 'array'],
            'category_ids.*' => ['required_if:item_category_type,select_category', 'integer', 'exists:item_categories,id'],
            'item_ids' => ['required_if:item_category_type,select_item', 'array'],
            'item_ids.*' => ['required_if:item_category_type,select_item', 'integer', 'exists:items,id'],
        ];
    }
}
