<?php

namespace App\Services;

use App\Data\Users\CreateUserData;
use App\Data\Users\DeleteUserData;
use App\Data\Users\UpdateUserData;
use App\Models\BlobAttachments;
use App\Models\Features;
use App\Models\Permissions;
use App\Models\Roles;
use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as BaseCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\LaravelData\Optional;

class UsersService
{
    public function __construct(
        protected ActivityLogService $activityLogService,
        protected BlobAttachmentsService $blobAttachmentsService,
        protected NotificationService $notificationService
    ) {}

    public function getManyUsers(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $search = trim($filters['search'] ?? '');

        $queryCallback = function ($query) use ($search) {
            $query->with([
                'roles:id,code,name',
                'assigned_stock_locations:id,name,tag',
                'attachments',
            ]);
            $query->when($search !== '', fn ($q) => $q->where(fn ($sq) => $sq->whereRaw("CONCAT_WS(' ', first_name, middle_name, last_name) LIKE ?", ["%{$search}%"])
                ->orWhereHas('assigned_stock_locations', fn ($lq) => $lq->where('name', 'like', "%{$search}%"))
                ->orWhereHas('roles', fn ($rq) => $rq->where('name', 'like', "%{$search}%"))
            ));
        };

        $users = ($search !== '') ? User::search($search)
            ->query($queryCallback)
            ->paginate($perPage)
            ->withQueryString() : User::query()
            ->tap($queryCallback)
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $users->getCollection()->each(function ($user) {
            if ($user->user_signature) {
                $user->setRelation('signature_attachment',
                    $user->attachments->firstWhere('file_url', $user->user_signature)
                );
            }

            if ($user->user_image) {
                $user->setRelation('img_attachment',
                    $user->attachments->firstWhere('file_url', $user->user_image)
                );
            }
        });

        return $users;
    }

    public function getUserById(int $id): ?User
    {
        $user = User::with([
            'roles:id,code,name',
            'assigned_stock_locations:id,name,tag',
        ])->find($id);

        if (! $user) {
            return null;
        }

        if ($user->user_signature) {
            $user->setAttribute('signature_attachment', BlobAttachments::query()->where('file_url', $user->user_signature)
                ->where('user_id', $user->id)
                ->first());
        }

        if ($user->user_image) {
            $user->setAttribute('img_attachment', BlobAttachments::query()->where('file_url', $user->user_image)
                ->where('user_id', $user->id)
                ->first());
        }

        return $user;
    }

    public function getStockLocations(): Collection
    {
        return StockLocation::query()->select('id', 'name')->get();
    }

    public function getRoles(): Collection
    {
        return Roles::query()
            ->with(['app_features', 'app_permissions'])
            ->select('id', 'code', 'name')
            ->get();
    }

    public function getFeatures(): Collection
    {
        return Features::query()->select('id', 'tag', 'name')->get();
    }

    public function getPermissions(): Collection
    {
        return Permissions::query()->select('id', 'name')->get();
    }

    public function createUser(CreateUserData $data): User
    {
        return DB::transaction(function () use ($data) {
            $payload = [
                'first_name' => $data->first_name,
                'last_name' => $data->last_name,
                'middle_name' => $data->middle_name,
                'email' => $data->email,
                'password' => Hash::make($data->password),
                'user_signature' => $data->user_signature,
                'user_image' => $data->user_image,
            ];

            $user = User::create($payload);

            if ($data->user_signature) {
                $this->linkBlobAttachment($user, $data->user_signature);
            }

            if ($data->user_image) {
                $this->linkBlobAttachment($user, $data->user_image);
            }

            $this->syncUserRelations($user, $data->stock_location_ids, $data->roles);
            $this->notificationService->notify('created new', ['user_management:read'], 'user', $user->name);

            return $user->fresh(['roles', 'assigned_stock_locations']);
        });
    }

    public function updateUser(User $user, UpdateUserData $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $oldSignature = $user->user_signature;
            $oldImg = $user->user_image;

            $payload = [
                'first_name' => $data->first_name,
                'last_name' => $data->last_name,
                'middle_name' => $data->middle_name,
                'email' => $data->email,
                'user_signature' => $data->user_signature,
                'user_image' => $data->user_image,
            ];

            if (! $data->password instanceof Optional && $data->password !== null) {
                $payload['password'] = Hash::make($data->password);
            }

            $user->fill($payload)->save();

            $this->handleBlobFieldUpdate($user, $data->user_signature, 'user_signature', $oldSignature);
            $this->handleBlobFieldUpdate($user, $data->user_image, 'user_image', $oldImg);
            $this->syncUserRelations($user, $data->stock_location_ids, $data->roles);
            $this->notificationService->notify('updated', ['user_management:read'], 'user', $user->name);

            return $user->fresh(['roles', 'assigned_stock_locations']);
        });
    }

    protected function handleBlobFieldUpdate(User $user, ?string $newValue, string $field, ?string $oldValue): void
    {
        if ($newValue === $oldValue) {
            return;
        }

        $this->deleteOldBlobAttachment($oldValue);
        $this->linkBlobAttachment($user, $newValue);
    }

    protected function deleteOldBlobAttachment(?string $oldUrl): void
    {
        if (! $oldUrl) {
            return;
        }

        $oldAttachment = BlobAttachments::query()->where('file_url', $oldUrl)->first();

        if (! $oldAttachment) {
            return;
        }

        try {
            $this->blobAttachmentsService->deleteBlobAttachmentById($oldAttachment->id);
        } catch (\Exception $e) {
            logger()->warning('Failed to delete old blob attachment: '.$e->getMessage());
        }
    }

    protected function linkBlobAttachment(User $user, ?string $url): void
    {
        if (! $url) {
            return;
        }

        BlobAttachments::query()->where('file_url', $url)
            ->update(['user_id' => $user->id]);
    }

    protected function syncUserRelations(User $user, array $locationIds, array $roleIds): void
    {
        $user->roles()->sync($roleIds);
        $user->assigned_stock_locations()->sync($locationIds);
    }

    public function deleteUser(DeleteUserData $data): bool
    {
        $deleted = $data->user->delete($data->user->id);

        if ($deleted) {
            $this->notificationService->notify('deleted', ['user_management:read'], 'user', $data->user->name);

        }

        return $deleted;
    }

    public function getSimpleUsersList(): BaseCollection
    {
        return User::query()
            ->select('id', 'first_name', 'last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (User $user) => [
                'value' => (string) $user->id,
                'label' => $user->name,
            ]);
    }
}
