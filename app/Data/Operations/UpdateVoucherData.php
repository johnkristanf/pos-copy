<?php

namespace App\Data\Operations;

use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateVoucherData extends Data
{
    public function __construct(
        public string $code,
        public string $type,
        public float $amount,
        public ?string $description = null,
        public ?float $min_spend = null,
        public ?float $capped_amount = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        $voucherId = request()->route('voucher')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('vouchers', 'code')->ignore($voucherId),
            ],
            'description' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:percentage,amount,to_cash_price,complimentary'],
            'amount' => ['required', 'numeric', 'min:0'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'capped_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
