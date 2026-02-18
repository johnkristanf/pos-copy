<?php

namespace App\Services;

use App\Models\Customers;

class CreditService
{
    public function deductCustomerCreditBalance(Customers $customer, $paidAmount)
    {
        if ($paidAmount > 0 && $customer->credit) {
            $customer->credit->balance = max(0, $customer->credit->balance - $paidAmount);
            $customer->credit->save();
        }
    }
}
