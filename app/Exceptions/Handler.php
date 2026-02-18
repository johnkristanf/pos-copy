<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $_e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $e)
    {
        $response = parent::render($request, $e);

        // Only handle Inertia requests
        if ($request->header('X-Inertia')) {
            // Don't handle validation exceptions
            if ($e instanceof ValidationException) {
                return $response;
            }

            // Don't handle authentication exceptions
            if ($e instanceof AuthenticationException) {
                return $response;
            }

            $statusCode = $this->getStatusCode($e, $response);
            $errorData = $this->getErrorData($e, $statusCode);

            return Inertia::render('error', $errorData)
                ->toResponse($request)
                ->setStatusCode($statusCode);
        }

        return $response;
    }

    /**
     * Get the status code from the exception or response.
     */
    protected function getStatusCode(Throwable $e, $response): int
    {
        if ($e instanceof HttpExceptionInterface) {
            return $e->getStatusCode();
        }

        return method_exists($response, 'getStatusCode')
            ? $response->getStatusCode()
            : 500;
    }

    /**
     * Get error data to pass to the error page.
     */
    protected function getErrorData(Throwable $e, int $statusCode): array
    {
        $isDev = config('app.debug');
        $errorMessages = $this->getErrorMessages();

        return [
            'status' => $statusCode,
            'title' => $errorMessages[$statusCode]['title'] ?? 'Error',
            'description' => $errorMessages[$statusCode]['description'] ?? 'An error occurred',
            'isDev' => $isDev,
            'error' => $isDev ? [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => collect($e->getTrace())->take(5)->map(function ($trace) {
                    return [
                        'file' => $trace['file'] ?? 'unknown',
                        'line' => $trace['line'] ?? 0,
                        'function' => $trace['function'] ?? 'unknown',
                        'class' => $trace['class'] ?? null,
                    ];
                })->all(),
            ] : null,
        ];
    }

    /**
     * Get user-friendly error messages for common status codes.
     */
    protected function getErrorMessages(): array
    {
        return [
            400 => [
                'title' => 'Bad Request',
                'description' => 'The request could not be understood by the server.',
            ],
            401 => [
                'title' => 'Unauthorized',
                'description' => 'You need to be authenticated to access this resource.',
            ],
            403 => [
                'title' => 'Forbidden',
                'description' => 'You don\'t have permission to access this resource.',
            ],
            404 => [
                'title' => 'Page Not Found',
                'description' => 'The page you\'re looking for doesn\'t exist or has been moved.',
            ],
            405 => [
                'title' => 'Method Not Allowed',
                'description' => 'The HTTP method used is not supported for this route.',
            ],
            419 => [
                'title' => 'Page Expired',
                'description' => 'Your session has expired. Please refresh and try again.',
            ],
            429 => [
                'title' => 'Too Many Requests',
                'description' => 'You\'ve made too many requests. Please slow down.',
            ],
            500 => [
                'title' => 'Server Error',
                'description' => 'Something went wrong on our end. We\'re working to fix it.',
            ],
            503 => [
                'title' => 'Service Unavailable',
                'description' => 'The service is temporarily unavailable. Please try again later.',
            ],
        ];
    }
}
