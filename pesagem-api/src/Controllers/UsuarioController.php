<?php

namespace App\Controllers;

use App\Response;
use App\Middleware\AuthMiddleware;
use App\Models\Usuario;

class UsuarioController
{
    private $usuarioModel;

    public function __construct()
    {
        $this->usuarioModel = new Usuario();
    }

    public function criar()
    {
        AuthMiddleware::verifyAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        $campos_obrigatorios = ['nome', 'email', 'senha', 'role'];
        foreach ($campos_obrigatorios as $campo) {
            if (!isset($data[$campo])) {
                Response::error("Campo obrigatório ausente: $campo", 400);
            }
        }

        // Validar se email já existe
        $usuario_existente = $this->usuarioModel->findByEmail($data['email']);
        if ($usuario_existente) {
            Response::error('Usuário com este email já existe', 409);
        }

        // Validar role
        if (!in_array($data['role'], ['admin', 'operador'])) {
            Response::error('Role inválido. Use "admin" ou "operador"', 400);
        }

        try {
            $id = $this->usuarioModel->create($data);
            $usuario = $this->usuarioModel->obterPorId($id);
            
            // Remover senha da resposta
            unset($usuario['senha']);
            
            Response::success('Usuário criado com sucesso', $usuario, 201);
        } catch (\Exception $e) {
            Response::error('Erro ao criar usuário: ' . $e->getMessage(), 500);
        }
    }

    public function listar()
    {
        AuthMiddleware::verifyAdmin();

        try {
            $usuarios = $this->usuarioModel->listar();
            
            // Remover senhas da resposta
            foreach ($usuarios as &$usuario) {
                unset($usuario['senha']);
            }
            
            Response::success('Usuários listados com sucesso', $usuarios, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao listar usuários: ' . $e->getMessage(), 500);
        }
    }

    public function obter()
    {
        AuthMiddleware::verify();

        $id = $_GET['id'] ?? null;
        if (!$id) {
            Response::error('ID não fornecido', 400);
        }

        try {
            $usuario = $this->usuarioModel->obterPorId($id);
            if (!$usuario) {
                Response::error('Usuário não encontrado', 404);
            }
            
            unset($usuario['senha']);
            
            Response::success('Usuário obtido com sucesso', $usuario, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao obter usuário: ' . $e->getMessage(), 500);
        }
    }

    public function atualizar()
    {
        AuthMiddleware::verify();

        $id = $_GET['id'] ?? null;
        if (!$id) {
            Response::error('ID não fornecido', 400);
        }

        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $usuario = $this->usuarioModel->obterPorId($id);
            if (!$usuario) {
                Response::error('Usuário não encontrado', 404);
            }

            // Usuário comum só pode atualizar seus próprios dados
            $payload = AuthMiddleware::verify();
            if ($payload['role'] !== 'admin' && $payload['id'] != $id) {
                Response::error('Acesso negado', 403);
            }

            // Não permitir alterar role sem ser admin
            if (isset($data['role']) && $payload['role'] !== 'admin') {
                unset($data['role']);
            }

            // Se houver nova senha, fazer hash
            if (isset($data['senha'])) {
                $data['senha'] = password_hash($data['senha'], PASSWORD_BCRYPT);
            }

            $this->usuarioModel->update($id, $data);
            $usuario_atualizado = $this->usuarioModel->obterPorId($id);
            
            unset($usuario_atualizado['senha']);
            
            Response::success('Usuário atualizado com sucesso', $usuario_atualizado, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao atualizar usuário: ' . $e->getMessage(), 500);
        }
    }

    public function deletar()
    {
        AuthMiddleware::verifyAdmin();

        $id = $_GET['id'] ?? null;
        if (!$id) {
            Response::error('ID não fornecido', 400);
        }

        try {
            $usuario = $this->usuarioModel->obterPorId($id);
            if (!$usuario) {
                Response::error('Usuário não encontrado', 404);
            }

            $this->usuarioModel->delete($id);
            Response::success('Usuário deletado com sucesso', null, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao deletar usuário: ' . $e->getMessage(), 500);
        }
    }
}
