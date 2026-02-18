<?php

namespace App\Http\Controllers\Integration;

use App\Data\ApiKeys\CreateApiKeyData;
use App\Data\ApiKeys\DeleteApiKeyData;
use App\Data\ApiKeys\UpdateApiKeyData;
use App\Http\Controllers\Controller;
use App\Models\ApiKeys;
use App\Models\Apps;
use App\Services\ApiKeyService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeyController extends Controller
{
    public function __construct(
        private readonly ApiKeyService $apiKeyService
    ) {}

    public function renderApiKeyPage(string $slug, Apps $app): Response
    {
        if ($app->slug !== $slug) {
            abort(404);
        }

        $filters = request()->only([
            'search',
            'search_by',
            'date_from',
            'date_to',
            'type',
            'key_expiration_id',
        ]);

        $filters['app_id'] = $app->id;
        $filters['search_by'] ??= 'label';

        return Inertia::render('integration/api-keys', [
            'apiKeys' => $this->apiKeyService->getManyApiKeys($filters, request()->integer('limit', 10)),
            'app' => [
                'id' => $app->id,
                'name' => $app->name,
                'slug' => $app->slug,
            ],
            'features' => Inertia::defer($this->apiKeyService->getAvailableFeatures(...)),
            'keyExpirationOptions' => Inertia::defer($this->apiKeyService->getKeyExpirationOptions(...)),
            'filters' => $filters,
        ]);
    }

    public function createApiKey(CreateApiKeyData $data, string $slug, Apps $app): RedirectResponse
    {
        if ($app->slug !== $slug) {
            abort(404);
        }

        $this->apiKeyService->createApiKey($data, $app->id);

        return back()->with('success', 'API key created successfully!');
    }

    public function updateApiKey(UpdateApiKeyData $data, string $slug, Apps $app, ApiKeys $apikey): RedirectResponse
    {
        if ($app->slug !== $slug || $apikey->app_id !== $app->id) {
            abort(404);
        }

        $this->apiKeyService->updateApiKey($apikey, $data);

        return back()->with('success', 'API Key updated successfully.');
    }

    public function deleteApiKey(string $slug, Apps $app, ApiKeys $apikey): RedirectResponse
    {
        if ($app->slug !== $slug || $apikey->app_id !== $app->id) {
            abort(404);
        }

        $data = new DeleteApiKeyData($apikey);

        $this->apiKeyService->deleteApiKey($data);

        return back()->with('success', 'API key deleted successfully!');
    }
}
