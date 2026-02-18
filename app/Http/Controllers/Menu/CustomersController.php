<?php

namespace App\Http\Controllers\Menu;

use App\Data\Menu\CreateCustomerData;
use App\Data\Menu\DeleteCustomerData;
use App\Data\Menu\PayCreditOrderData;
use App\Data\Menu\SetCustomerCreditData;
use App\Data\Menu\UpdateCustomerData;
use App\Http\Controllers\Controller;
use App\Models\Customers;
use App\Models\Orders;
use App\Services\CreditService;
use App\Services\CustomersService;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomersController extends Controller
{
    public function __construct(
        protected CustomersService $customersService,
        protected PaymentService $paymentService,
        protected CreditService $creditService,
    ) {}

    public function renderCustomersPage(): Response
    {
        $filters = request()->only(['search', 'search_by', 'date_from', 'date_to', 'location_id']);
        $perPage = request()->integer('per_page', 10);

        return Inertia::render('customers', [
            'customers' => $this->customersService->getManyCustomers($filters, $perPage),
            'filters' => $filters,
        ]);
    }

    public function renderCustomerProfilePage(int $customerId): Response
    {
        $customer = $this->customersService->getCustomerById($customerId);

        if (! $customer) {
            abort(404, 'Customer not found');
        }

        return Inertia::render('customers/profile', [
            'customer' => $customer,
            'recentOrders' => Inertia::defer(
                fn () => $this->customersService->getRecentOrdersByCustomer($customer)
            ),
        ]);
    }

    public function createCustomer(CreateCustomerData $data): RedirectResponse
    {
        $this->customersService->createCustomer($data);

        return back()->with('success', 'Customer created successfully');
    }

    public function setCustomerCredit(SetCustomerCreditData $data): RedirectResponse
    {
        $customer = Customers::findOrFail($data->customer_id);

        $customer->credit()->create([
            'limit' => $data->limit,
            'term' => $data->term,
            'balance' => 0,
            'rating' => 0,
        ]);

        return redirect()->route('customers.renderCustomerProfilePage', ['customerId' => $customer->id])
            ->with('success', 'Customer credit created successfully.');
    }

    public function payCreditOrder(PayCreditOrderData $data): RedirectResponse
    {
        $order = Orders::with(['customer.credit'])->findOrFail($data->order_id);
        $customer = $order->customer;

        $this->paymentService->recordOrderCreditsPayment($order->id, $data->amount);
        $this->creditService->deductCustomerCreditBalance($customer, $data->amount);

        return back()->with('success', 'Credit paid successfully');
    }

    public function updateCustomer(UpdateCustomerData $data, Customers $customers): RedirectResponse
    {
        $this->customersService->updateCustomer($customers, $data);

        return back()->with('success', 'Customer updated successfully');
    }

    public function deleteCustomer(DeleteCustomerData $data): RedirectResponse
    {
        $this->customersService->deleteCustomer($data);

        return back()->with('success', 'Customer deleted successfully');
    }
}
