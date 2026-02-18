<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string|null $file_id
 * @property int|null $item_id
 * @property int|null $customer_id
 * @property int|null $user_id
 * @property string $file_name
 * @property string $file_path
 * @property string $file_url
 * @property string|null $mime_type
 * @property int|null $file_size
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Customers|null $customer
 * @property-read \App\Models\Items|null $item
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereFileId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereFileUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BlobAttachments withoutTrashed()
 * @mixin \Eloquent
 */
class BlobAttachments extends Model
{
    use Searchable, SoftDeletes;

    protected $guarded = ['id'];

    protected $fillable = [
        'item_id',
        'file_id',
        'customer_id',
        'user_id',
        'file_name',
        'file_path',
        'file_url',
        'mime_type',
        'file_size',
    ];

    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'file_url' => $this->file_url,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customers::class, 'customer_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
