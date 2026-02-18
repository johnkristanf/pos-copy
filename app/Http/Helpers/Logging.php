<?php

namespace App\Http\Helpers;

use Illuminate\Http\Request;
use Jenssegers\Agent\Agent;

class Logging
{
    public static function detectDeviceType(?Agent $agent = null): string
    {
        $agent ??= new Agent();

        if ($agent->isTablet()) {
            return 'Tablet';
        }

        if ($agent->isMobile()) {
            return 'Mobile';
        }

        if ($agent->isDesktop()) {
            return 'Desktop';
        }

        if ($agent->isRobot()) {
            return 'Bot';
        }

        return 'Unknown';
    }

    public static function getDeviceInfo(?Request $request = null): array
    {
        $request = $request ??= request();
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());

        return [
            'device_type' => self::detectDeviceType($agent),
            'platform' => $agent->platform(),
            'platform_version' => $agent->version($agent->platform()),
            'browser' => $agent->browser(),
            'browser_version' => $agent->version($agent->browser()),
            'is_robot' => $agent->isRobot(),
            'robot_name' => $agent->robot(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];
    }

    public static function getBrowserInfo(?Agent $agent = null): string
    {
        $agent = $agent ??= new Agent();
        $browser = $agent->browser();
        $version = $agent->version($browser);

        return $browser.($version ? " {$version}" : '');
    }

    public static function getPlatformInfo(?Agent $agent = null): string
    {
        $agent = $agent ??= new Agent();
        $platform = $agent->platform();
        $version = $agent->version($platform);

        $clientHintVersion = request()->header('sec-ch-ua-platform-version');
        $clientHintVersion = trim($clientHintVersion, '"');

        if ($platform === 'Windows' && ! empty($clientHintVersion)) {
            $majorVersion = (int) explode('.', $clientHintVersion)[0];

            if ($majorVersion >= 13) {
                return 'Windows 11';
            }
        }

        return $platform.($version ? " {$version}" : '');
    }

    public static function isBot(?Agent $agent = null): bool
    {
        $agent = $agent ??= new Agent();

        return $agent->isRobot();
    }
}
