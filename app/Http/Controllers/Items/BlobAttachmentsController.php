<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\GetManyBlobAttachmentsData;
use App\Data\Items\UpdateBlobAttachmentByIdData;
use App\Data\Items\UploadAttachmentByIdData;
use App\Http\Controllers\Controller;
use App\Services\BlobAttachmentsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class BlobAttachmentsController extends Controller
{
    public function __construct(
        protected BlobAttachmentsService $blobAttachmentsService
    ) {}

    public function getManyBlobAttachments(GetManyBlobAttachmentsData $data): JsonResponse
    {
        $attachments = $this->blobAttachmentsService->getManyBlobAttachments($data);

        return response()->json($attachments);
    }

    public function uploadBlobAttachmentById(UploadAttachmentByIdData $data): JsonResponse
    {
        $attachment = $this->blobAttachmentsService->uploadBlobAttachment($data);

        return response()->json($attachment, 201);
    }

    public function getBlobAttachmentById(int $id): JsonResponse
    {
        return response()->json($this->blobAttachmentsService->getBlobAttachmentById($id));
    }

    public function updateBlobAttachmentById(UpdateBlobAttachmentByIdData $data, int $id): JsonResponse
    {
        $attachment = $this->blobAttachmentsService->updateBlobAttachmentById($id, $data);

        return response()->json($attachment);
    }

    public function deleteBlobAttachmentById(int $id): Response
    {
        $this->blobAttachmentsService->deleteBlobAttachmentById($id);

        return response()->noContent();
    }
}
