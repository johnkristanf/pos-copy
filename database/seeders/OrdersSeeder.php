<?php

namespace Database\Seeders;

use App\Models\Customers;
use App\Models\Items;
use App\Models\OrderItem;
use App\Models\Orders;
use App\Models\PaymentMethods;
use App\Models\Payments;
use App\Models\UnitOfMeasure;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrdersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customers::all();
        $items = Items::all();
        $paymentMethods = PaymentMethods::all();
        $uoms = UnitOfMeasure::all();
        $users = User::all();

        if ($customers->isEmpty() || $items->isEmpty() || $paymentMethods->isEmpty() || $uoms->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Skipping OrdersSeeder: Missing dependencies (Customers, Items, PaymentMethods, UOMs, or Users).');

            return;
        }

        DB::transaction(function () use ($customers, $items, $paymentMethods, $uoms, $users) {
            for ($i = 0; $i < 20; $i++) {
                $customer = $customers->random();
                $paymentMethod = $paymentMethods->random();

                $order = Orders::create([
                    'customer_id' => $customer->id,
                    'payment_method_id' => $paymentMethod->id,
                    'payment_status' => $this->getRandomPaymentStatus(),
                    'is_draft' => false,
                    'total_payable' => 0,
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now(),
                ]);

                $order->order_user_status()->attach($users->random()->id, [
                    'status' => $this->getRandomOrderStatus(),
                ]);

                $orderTotal = 0;
                $itemCount = rand(1, 5);

                for ($j = 0; $j < $itemCount; $j++) {
                    $item = $items->random();
                    $quantity = rand(1, 10);
                    $simulatedPrice = rand(100, 1000);
                    $lineTotal = $simulatedPrice * $quantity;
                    $orderTotal += $lineTotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'item_id' => $item->id,
                        'selected_uom_id' => $uoms->random()->id,
                        'quantity' => $quantity,
                    ]);
                }

                $order->total_payable = $orderTotal;
                $order->save();
            }
        });
    }

    private function getRandomPaymentStatus(): string
    {
        $statuses = [
            Payments::PENDING,
            Payments::FULLY_PAID,
            Payments::PARTIALLY_PAID,
        ];

        return $statuses[array_rand($statuses)];
    }

    private function getRandomOrderStatus(): string
    {
        $statuses = [
            Orders::ACTIVE,
            Orders::COMPLETED,
            Orders::CANCELLED,
        ];

        return $statuses[array_rand($statuses)];
    }
}
