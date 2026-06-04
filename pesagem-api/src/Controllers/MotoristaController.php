<?php

namespace App\Controllers;

use App\Response;
use App\Middleware\AuthMiddleware;
use App\Models\Motorista;

class MotoristaController
{
    private $motoristaModel;

    public function __construct()
    {
        $this->motoristaModel = new Motorista();
    }

    public function criar()
    {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);

        $campos_obrigatorios = ['nome', 'documento', 'telefone'];
        foreach ($campos_obrigatorios as $campo) {
            if (!isset($data[$campo])) {
                Response::error("Campo obrigatório ausente: $campo", 400);
            }
        }

        // Validar se documento já existe
        $motorista_existente = $this->motoristaModel->findByDocumento($data['documento']);
        if ($motorista_existente) {
            Response::error('Motorista com este documento já existe', 409);
        }

        try {
            $id = $this->motoristaModel->criar($data);
            $motorista = $this->motoristaModel->obterPorId($id);
            Response::success('Motorista criado com sucesso', $motorista, 201);
        } catch (\Exception $e) {
            Response::error('Erro ao criar motorista: ' . $e->getMessage(), 500);
        }
    }

    public function listar()
    {
        AuthMiddleware::verify();

        try {
            $motoristas = $this->motoristaModel->listar();
            Response::success('Motoristas listados com sucesso', $motoristas, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao listar motoristas: ' . $e->getMessage(), 500);
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
            $motorista = $this->motoristaModel->obterPorId($id);
            if (!$motorista) {
                Response::error('Motorista não encontrado', 404);
            }
            Response::success('Motorista obtido com sucesso', $motorista, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao obter motorista: ' . $e->getMessage(), 500);
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
            $motorista = $this->motoristaModel->obterPorId($id);
            if (!$motorista) {
                Response::error('Motorista não encontrado', 404);
            }

            $this->motoristaModel->atualizar($id, $data);
            $motorista_atualizado = $this->motoristaModel->obterPorId($id);
            Response::success('Motorista atualizado com sucesso', $motorista_atualizado, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao atualizar motorista: ' . $e->getMessage(), 500);
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
            $motorista = $this->motoristaModel->obterPorId($id);
            if (!$motorista) {
                Response::error('Motorista não encontrado', 404);
            }

            $this->motoristaModel->deletar($id);
            Response::success('Motorista deletado com sucesso', null, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao deletar motorista: ' . $e->getMessage(), 500);
        }
    }
}
