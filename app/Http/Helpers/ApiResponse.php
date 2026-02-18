<?php

namespace App\Http\Helpers;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiResponse
{
    public static function Success(string $message, int $code, $data = null, string $status = 'success'): JsonResponse
    {
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    public static function Error(string $message, int $code, $errors = null, $re_authenticate = false, $token_refresh = false): JsonResponse
    {
        $response = [
            'status' => 'error',
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        if ($re_authenticate) {
            $response['re_authenticate'] = true;
        }

        if ($token_refresh) {
            $response['token_refresh'] = true;
        }

        return response()->json($response, $code);
    }

    public static function ValidationError(string $message, $errors): JsonResponse
    {
        return self::Error($message, Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }

    public static function NotFound(string $message = 'Resource not found'): JsonResponse
    {
        return self::Error($message, Response::HTTP_NOT_FOUND);
    }

    public static function Unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return self::Error($message, Response::HTTP_UNAUTHORIZED);
    }

    public static function Forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return self::Error($message, Response::HTTP_FORBIDDEN);
    }

    public static function MethodNotAllowed(string $message = 'Method Not Allowed'): JsonResponse
    {
        return self::Error($message, Response::HTTP_METHOD_NOT_ALLOWED);
    }
}
