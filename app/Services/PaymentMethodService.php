<?php

namespace App\Services;

use App\Models\PaymentMethods;

class PaymentMethodService
{
    public function getAllPaymentMethods(array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = PaymentMethods::query();

        $this->applyFilters($query, $filters);

        return $query->latest('created_at')->get();
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $searchTerm = '%'.trim($search).'%';
            $q->where(function ($sub) use ($searchTerm) {
                $sub->where('name', 'like', $searchTerm)
                    ->orWhere('tag', 'like', $searchTerm);
            });
        });

        $query->when($filters['date_from'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '>=', $date);
        });

        $query->when($filters['date_to'] ?? null, function ($q, $date) {
            $q->whereDate('created_at', '<=', $date);
        });
    }
}
