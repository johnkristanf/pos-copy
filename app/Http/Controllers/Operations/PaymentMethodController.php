<?php

namespace App\Http\Controllers\Operations;

use App\Http\Controllers\Controller;
use App\Models\UnitOfMeasure;
use App\Services\PaymentMethodService;
use Inertia\Inertia;
use Request;

class PaymentMethodController extends Controller
{
    public function __construct(
        protected PaymentMethodService $paymentMethodService,
    ) {}

    public function renderPaymentMethodPage()
    {
        $filters = [
            'search' => request()->get('search'),
            'date_from' => request()->get('date_from'),
            'date_to' => request()->get('date_to'),
        ];

        $paymentMethods = $this->paymentMethodService->getAllPaymentMethods($filters);

        return Inertia::render('operations/payment-method', [
            'paymentMethods' => $paymentMethods,
            'filters' => $filters,
        ]);
    }

    public function createPaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'tag' => 'required|string|max:255|unique:unit_of_measures,code',
            'name' => 'required|string|max:255',
        ]);

        UnitOfMeasure::create($validated);

        return redirect()->back()->with('success', 'Unit created successfully.');
    }
}
