<?php

namespace Database\Factories;

use App\Models\Customers;
use App\Models\Locations;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customers>
 */
class CustomersFactory extends Factory
{
    protected $model = Customers::class;

    public function definition(): array
    {
        static $number = 1;
        $code = 'CUST-'.str_pad($number++, 3, '0', STR_PAD_LEFT);
        $locationId = Locations::query()->inRandomOrder()->value('id');

        return [
            'customer_code' => $code,
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->companyEmail(),
            'contact_no' => $this->faker->phoneNumber(),
            'affiliated' => $this->faker->boolean(30),
            'isactive' => true,
            'location_id' => $locationId,
        ];
    }
}
