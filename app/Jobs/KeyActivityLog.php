<?php

namespace App\Jobs;

use App\Http\Traits\HasActivityLog as ActivityLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class KeyActivityLog implements ShouldQueue
{
    use ActivityLog, Queueable;

    protected $requestData;

    protected $apiKeyID;

    public function __construct(array $requestData, $apiKeyID)
    {
        $this->requestData = $requestData;
        $this->apiKeyID = $apiKeyID;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->logKeyActivity($this->requestData, $this->apiKeyID);
    }
}
