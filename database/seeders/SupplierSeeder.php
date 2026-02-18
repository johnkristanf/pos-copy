<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Seeder;

// Added for potentially disabling foreign key checks

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $suppliers = [
            [
                'name' => 'WELD POWERTOOLS INDUSTRIAL MACHINERY CORPORATION',
                'email' => 'weldindustrial.davao@gmail.com',
                'contact_person' => 'BARRON R. BACALANOS',
                'contact_no' => '09079428045',
                'telefax' => '',
                'address' => 'TRI-EVEREST BUILDING KM.5 J.P. LAUREL AVENUE, BAJADA DAVAO CITY',
                'shipping' => 'DELIVER',
                'terms' => '60-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'TAGUM RADIO SUPPLY AND REAL ESTATE LESSOR',
                'email' => '',
                'contact_person' => 'MARCELINA D. LIM',
                'contact_no' => '',
                'telefax' => '',
                'address' => 'RIZAL ST. MAGUGPO POBLACION, TAGUM CITY',
                'shipping' => 'PICK UP',
                'terms' => 'CASH',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SOUTHERN INDUSTRIAL MACHINERY CORPORATION',
                'email' => 'southernindustrial@gmail.com',
                'contact_person' => 'ROBERTO G. SANTOS',
                'contact_no' => '09171234567',
                'telefax' => '',
                'address' => 'J.P. LAUREL AVENUE, DAVAO CITY',
                'shipping' => 'DELIVER',
                'terms' => '30-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'MEGA CONSTRUCTION SUPPLY',
                'email' => 'megaconstructionsupply@gmail.com',
                'contact_person' => 'ALFREDO M. REYES',
                'contact_no' => '09205566789',
                'telefax' => '',
                'address' => 'QUIRINO AVENUE, DAVAO CITY',
                'shipping' => 'DELIVER',
                'terms' => '30-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'EASTERN ELECTRICAL SUPPLY',
                'email' => 'easternelectrical@gmail.com',
                'contact_person' => 'MARIA L. TAN',
                'contact_no' => '09335551234',
                'telefax' => '',
                'address' => 'ILUSTRE STREET, DAVAO CITY',
                'shipping' => 'DELIVER',
                'terms' => '45-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'NORTHERN AUTO PARTS SUPPLY',
                'email' => 'northernautoparts@gmail.com',
                'contact_person' => 'JOSEPH C. LIM',
                'contact_no' => '09189998877',
                'telefax' => '',
                'address' => 'MAGUGPO POBLACION, TAGUM CITY',
                'shipping' => 'PICK UP',
                'terms' => 'CASH',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'PRIME HARDWARE & INDUSTRIAL SUPPLY',
                'email' => 'primehardware@gmail.com',
                'contact_person' => 'EDUARDO V. CRUZ',
                'contact_no' => '09061239876',
                'telefax' => '',
                'address' => 'NATIONAL HIGHWAY, PANABO CITY',
                'shipping' => 'DELIVER',
                'terms' => '30-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'GLOBAL INDUSTRIAL SALES CORPORATION',
                'email' => 'globalindustrialsales@gmail.com',
                'contact_person' => 'ANTONIO R. GARCIA',
                'contact_no' => '09175554433',
                'telefax' => '',
                'address' => 'R. CASTILLO STREET, DAVAO CITY',
                'shipping' => 'DELIVER',
                'terms' => '60-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'METRO DAVAO TRADING',
                'email' => 'metrodavaotrading@gmail.com',
                'contact_person' => 'LUCIA P. RAMOS',
                'contact_no' => '09226667788',
                'telefax' => '',
                'address' => 'MATINA, DAVAO CITY',
                'shipping' => 'DELIVER',
                'terms' => '30-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'UNITED CONSTRUCTION & INDUSTRIAL SUPPLY',
                'email' => 'unitedconstruction@gmail.com',
                'contact_person' => 'FERDINAND Q. LOPEZ',
                'contact_no' => '09173334455',
                'telefax' => '',
                'address' => 'CABAGUIO AVENUE, DAVAO CITY',
                'shipping' => 'DELIVER',
                'terms' => '45-DAYS',
                'location_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('suppliers')->insert($suppliers);
    }
}
