<?php

namespace App\Middleware;

use App\JWT;
use App\Response;

class AuthMiddleware
{
    public static function verify()
    {
        $token = JWT::getTokenFromHeader();

        if (!$token) {
            Response::error('Token não fornecido', 401);
        }

        $payload = JWT::decode($token);

        if (!$payload) {
            Response::error('Token inválido ou expirado', 401);
        }

        return $payload;
    }

    public static function verifyAdmin()
    {
        $payload = self::verify();

        if ($payload['role'] !== 'admin') {
            Response::error('Acesso negado. Apenas administradores podem acessar este recurso', 403);
        }

        return $payload;
    }
}
