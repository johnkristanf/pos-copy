<?php

namespace App\Data\Returns;

use Illuminate\Http\Request;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class RejectRFCFormData extends Data
{
    public function __construct(
        public int $id
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'id' => ['required', 'integer', 'exists:return_from_customers,id'],
        ];
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            id: (int) $request->route('id')
        );
    }
}
