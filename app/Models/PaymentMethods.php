<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $tag
 * @property string $name
 * @property string $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods whereTag($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentMethods whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class PaymentMethods extends Model
{
    public const CASH = 'cash';

    public const CREDIT = 'credit';

    public const CHECK = 'check';

    public const BANK_TRANSFER = 'bank_transfer';

    public const ALL = 'all';
}
