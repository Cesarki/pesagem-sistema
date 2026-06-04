<?php

namespace App\Controllers;

use App\Response;
use App\JWT;
use App\Models\Usuario;

class AuthController
{
    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['senha'])) {
            Response::error('Email e senha são obrigatórios', 400);
        }

        $usuarioModel = new Usuario();
        $usuario = $usuarioModel->findByEmail($data['email']);

        if (!$usuario) {
            Response::error('Usuário não encontrado', 401);
        }

        if (!$usuarioModel->verificarSenha($data['senha'], $usuario['senha'])) {
            Response::error('Senha incorreta', 401);
        }

        $token = JWT::encode([
            'id' => $usuario['id'],
            'email' => $usuario['email'],
            'nome' => $usuario['nome'],
            'role' => $usuario['role']
        ]);

        Response::success('Login realizado com sucesso', [
            'token' => $token,
            'usuario' => [
                'id' => $usuario['id'],
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'role' => $usuario['role']
            ]
        ], 200);
    }

    public function logout()
    {
        Response::success('Logout realizado com sucesso', null, 200);
    }

    public function verificarToken()
    {
        $payload = JWT::getTokenFromHeader();

        if (!$payload) {
            Response::error('Token não fornecido', 401);
        }

        $decoded = JWT::decode($payload);

        if (!$decoded) {
            Response::error('Token inválido ou expirado', 401);
        }

        Response::success('Token válido', $decoded, 200);
    }
}
