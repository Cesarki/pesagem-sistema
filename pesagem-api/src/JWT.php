<?php

namespace App;

class JWT
{
    private static $secret;

    public static function init()
    {
        self::$secret = getenv('JWT_SECRET') ?: 'sua_chave_secreta';
    }

    public static function encode($payload, $expiresIn = 86400)
    {
        self::init();
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresIn;

        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);

        $header = base64_encode($header);
        $payload = base64_encode($payload);

        $signature = hash_hmac('sha256', "$header.$payload", self::$secret, true);
        $signature = base64_encode($signature);

        return "$header.$payload.$signature";
    }

    public static function decode($token)
    {
        self::init();
        
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }

        list($header, $payload, $signature) = $parts;

        $valid_signature = hash_hmac('sha256', "$header.$payload", self::$secret, true);
        $valid_signature = base64_encode($valid_signature);

        if ($signature !== $valid_signature) {
            return false;
        }

        $payload = json_decode(base64_decode($payload), true);

        if ($payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    public static function getTokenFromHeader()
    {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
}
