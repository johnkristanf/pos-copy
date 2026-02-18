<?php

namespace App\Data\Returns;

use Illuminate\Http\Request;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class RejectRTSFormData extends Data
{
    public function __construct(
        public int $id
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'id' => ['required', 'integer', 'exists:returns_to_suppliers,id'],
        ];
    }

    public static function fromRequest(Request $request): self
    {
        $id = $request->route('return') instanceof \Illuminate\Database\Eloquent\Model
        ? $request->route('return')->getKey()
        : ($request->route('return') ?? $request->route('id'));

        return new self(
            id: (int) $id
        );
    }
}
