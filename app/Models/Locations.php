<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $country
 * @property string|null $region
 * @property string|null $province
 * @property string|null $municipality
 * @property string|null $barangay
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Customers> $customers
 * @property-read int|null $customers_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Suppliers> $suppliers
 * @property-read int|null $suppliers_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereBarangay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereMunicipality($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereProvince($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereRegion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Locations whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Locations extends Model
{
    protected $guarded = ['id'];

    public function customers()
    {
        return $this->hasMany(Customers::class, 'location_id');
    }

    public function suppliers()
    {
        return $this->hasMany(Suppliers::class, 'location_id');
    }

    /**
     * Find or create a location based on the given attributes.
     */
    public static function findOrCreateLocation(array $attributes): self
    {
        $cleanAttributes = array_map(fn ($val) => trim($val) ?: null, $attributes);

        $location = self::query()->where('country', $cleanAttributes['country'])
            ->where('region', $cleanAttributes['region'] ?? '')
            ->where('province', $cleanAttributes['province'] ?? '')
            ->where('municipality', $cleanAttributes['municipality'] ?? '')
            ->where('barangay', $cleanAttributes['barangay'] ?? '')
            ->first();

        if (! $location) {
            $location = self::create([
                'country' => $cleanAttributes['country'] ?? '',
                'region' => $cleanAttributes['region'] ?? '',
                'province' => $cleanAttributes['province'] ?? '',
                'municipality' => $cleanAttributes['municipality'] ?? '',
                'barangay' => $cleanAttributes['barangay'] ?? '',
            ]);
        }

        return $location;
    }
}
