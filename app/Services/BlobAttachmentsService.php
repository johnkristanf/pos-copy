<?php

namespace App\Services;

use App\Data\Items\GetManyBlobAttachmentsData;
use App\Data\Items\UpdateBlobAttachmentByIdData;
use App\Data\Items\UploadAttachmentByIdData;
use App\Models\BlobAttachments;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use ImageKit\ImageKit;

class BlobAttachmentsService
{
    public function getManyBlobAttachments(GetManyBlobAttachmentsData|array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $filtersArray = $filters instanceof GetManyBlobAttachmentsData
        ? $filters->toArray()
        : $filters;

        $search = trim($filtersArray['search'] ?? '');

        $queryCallback = function (Builder $query) use ($filtersArray) {
            $query->with([
                'item:id,sku,description',
                'customer:id,name',
                'user:id,first_name,last_name',
            ]);

            $this->applyFilters($query, $filtersArray);
            $query->latest();
        };

        if ($search !== '') {
            return BlobAttachments::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString();
        }

        $query = BlobAttachments::query();
        $queryCallback($query);

        return $query->paginate($perPage)->withQueryString();
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $query->when($filters['item_id'] ?? null, fn ($q, $id) => $q->where('item_id', $id))
            ->when($filters['customer_id'] ?? null, fn ($q, $id) => $q->where('customer_id', $id))
            ->when($filters['user_id'] ?? null, fn ($q, $id) => $q->where('user_id', $id))
            ->when($filters['date_from'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($filters['date_to'] ?? null, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($filters['mime_type'] ?? null, fn ($q, $m) => $q->where('mime_type', $m));
    }

    public function getBlobAttachmentById(int $id): BlobAttachments
    {
        return BlobAttachments::with(['item:id,sku,description', 'customer:id,name', 'user:id,first_name,last_name'])->findOrFail($id);
    }

    public function uploadBlobAttachment(UploadAttachmentByIdData $data, ?int $userId = null): BlobAttachments
    {
        return DB::transaction(function () use ($data, $userId) {
            $file = $data->file;
            $itemId = $data->item_id > 0 ? $data->item_id : null;
            $customerId = $data->customer_id > 0 ? $data->customer_id : null;
            $userId = $userId > 0 ? $userId : null;

            $imageKit = $this->getImageKitClient();

            $upload = $imageKit->upload([
                'file' => fopen($file->getPathname(), 'r'),
                'fileName' => $file->getClientOriginalName(),
                'useUniqueFileName' => true,
                'tags' => ['app_upload'],
            ]);

            if (! empty($upload->error)) {
                throw new \Exception('ImageKit Upload Failed: '.json_encode($upload->error));
            }

            $result = json_decode(json_encode($upload), true);
            $responseData = $result['success'] ?? $result['result'] ?? $result;

            return BlobAttachments::create([
                'file_id' => $responseData['fileId'],
                'item_id' => $itemId,
                'customer_id' => $customerId,
                'user_id' => $userId,
                'file_name' => $responseData['name'],
                'file_path' => $responseData['filePath'],
                'file_url' => $responseData['url'],
                'mime_type' => $file->getMimeType(),
                'file_size' => $responseData['size'],
            ]);
        });
    }

    public function uploadBlobAttachmentById(int $itemId, UploadedFile $file): BlobAttachments
    {
        $data = new UploadAttachmentByIdData(file: $file, item_id: $itemId);

        return $this->uploadBlobAttachment($data);
    }

    public function updateBlobAttachmentById(int $id, UpdateBlobAttachmentByIdData $data): BlobAttachments
    {
        return DB::transaction(function () use ($id, $data) {
            $attachment = $this->getBlobAttachmentById($id);
            $file = $data->file;

            if ($attachment->file_id) {
                try {
                    $this->getImageKitClient()->deleteFile($attachment->file_id);
                } catch (\Exception $e) {
                    logger()->error('Failed to delete old ImageKit file: '.$e->getMessage());
                }
            }

            $imageKit = $this->getImageKitClient();
            $upload = $imageKit->upload([
                'file' => fopen($file->getPathname(), 'r'),
                'fileName' => $file->getClientOriginalName(),
                'useUniqueFileName' => true,
                'tags' => ['app_upload'],
            ]);

            if (! empty($upload->error)) {
                throw new \Exception('ImageKit Upload Failed: '.json_encode($upload->error));
            }

            $result = json_decode(json_encode($upload), true);
            $responseData = $result['success'] ?? $result['result'] ?? $result;

            $attachment->fill([
                'file_id' => $responseData['fileId'],
                'file_name' => $responseData['name'],
                'file_path' => $responseData['filePath'],
                'file_url' => $responseData['url'],
                'mime_type' => $file->getMimeType(),
                'file_size' => $responseData['size'],
            ])->save();

            return $attachment;
        });
    }

    public function deleteBlobAttachmentById(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $attachment = $this->getBlobAttachmentById($id);

            if ($attachment->file_id) {
                try {
                    $imageKit = $this->getImageKitClient();
                    $imageKit->deleteFile($attachment->file_id);
                } catch (\Exception $e) {
                    throw new \Exception('ImageKit Deletion Failed: '.$e->getMessage());
                }
            }

            return $attachment->forceDelete();
        });
    }

    protected function getImageKitClient(): ImageKit
    {
        return new ImageKit(
            config('services.imagekit.public_key'),
            config('services.imagekit.private_key'),
            config('services.imagekit.url_endpoint')
        );
    }
}
