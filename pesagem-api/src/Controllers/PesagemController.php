<?php

namespace App\Controllers;

use App\Response;
use App\Middleware\AuthMiddleware;
use App\Models\Pesagem;
use App\Models\Motorista;

class PesagemController
{
    private $pesagemModel;
    private $motoristaModel;

    public function __construct()
    {
        $this->pesagemModel = new Pesagem();
        $this->motoristaModel = new Motorista();
    }

    public function criar()
    {
        AuthMiddleware::verify();

        $data = json_decode(file_get_contents('php://input'), true);

        $campos_obrigatorios = ['motorista_id', 'placa_caminhao', 'data_pesagem', 'hora_entrada', 'pesagem_inicial'];
        foreach ($campos_obrigatorios as $campo) {
            if (!isset($data[$campo])) {
                Response::error("Campo obrigatório ausente: $campo", 400);
            }
        }

        // Validar se motorista existe
        $motorista = $this->motoristaModel->obterPorId($data['motorista_id']);
        if (!$motorista) {
            Response::error('Motorista não encontrado', 404);
        }

        try {
            $id = $this->pesagemModel->criar($data);
            $pesagem = $this->pesagemModel->obterPorId($id);
            Response::success('Pesagem criada com sucesso', $pesagem, 201);
        } catch (\Exception $e) {
            Response::error('Erro ao criar pesagem: ' . $e->getMessage(), 500);
        }
    }

    public function listar()
    {
        AuthMiddleware::verify();

        try {
            $pesagens = $this->pesagemModel->listar();
            Response::success('Pesagens listadas com sucesso', $pesagens, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao listar pesagens: ' . $e->getMessage(), 500);
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
            $pesagem = $this->pesagemModel->obterPorId($id);
            if (!$pesagem) {
                Response::error('Pesagem não encontrada', 404);
            }
            Response::success('Pesagem obtida com sucesso', $pesagem, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao obter pesagem: ' . $e->getMessage(), 500);
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

        // Validar se pesagem existe
        $pesagem = $this->pesagemModel->obterPorId($id);
        if (!$pesagem) {
            Response::error('Pesagem não encontrada', 404);
        }

        try {
            // Se está finalizando, adicionar hora de saída
            if (isset($data['status']) && $data['status'] === 'Pesagem finalizada') {
                $data['hora_saida'] = date('H:i:s');
            }

            $this->pesagemModel->atualizar($id, $data);
            $pesagem_atualizada = $this->pesagemModel->obterPorId($id);
            Response::success('Pesagem atualizada com sucesso', $pesagem_atualizada, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao atualizar pesagem: ' . $e->getMessage(), 500);
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
            $pesagem = $this->pesagemModel->obterPorId($id);
            if (!$pesagem) {
                Response::error('Pesagem não encontrada', 404);
            }

            $this->pesagemModel->deletar($id);
            Response::success('Pesagem deletada com sucesso', null, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao deletar pesagem: ' . $e->getMessage(), 500);
        }
    }

    public function listarPendentes()
    {
        AuthMiddleware::verify();

        try {
            $pesagens = $this->pesagemModel->listarPendentes();
            Response::success('Pesagens pendentes listadas com sucesso', $pesagens, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao listar pesagens pendentes: ' . $e->getMessage(), 500);
        }
    }

    public function listarPorMotorista()
    {
        AuthMiddleware::verify();

        $motorista_id = $_GET['motorista_id'] ?? null;
        if (!$motorista_id) {
            Response::error('ID do motorista não fornecido', 400);
        }

        try {
            $pesagens = $this->pesagemModel->listarPorMotorista($motorista_id);
            Response::success('Pesagens do motorista listadas com sucesso', $pesagens, 200);
        } catch (\Exception $e) {
            Response::error('Erro ao listar pesagens: ' . $e->getMessage(), 500);
        }
    }
}
