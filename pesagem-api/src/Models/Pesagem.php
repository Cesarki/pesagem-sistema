<?php

namespace App\Models;

use PDO;

class Pesagem extends Model
{
    protected $table = 'pesagens';

    public function listar($limit = null, $offset = null)
    {
        return $this->findAll($limit, $offset);
    }

    public function obterPorId($id)
    {
        return $this->findById($id);
    }

    public function criar($data)
    {
        $data['criado_em'] = date('Y-m-d H:i:s');
        $data['status'] = 'Pesando';
        return parent::create($data);
    }

    public function atualizar($id, $data)
    {
        $data['atualizado_em'] = date('Y-m-d H:i:s');
        return parent::update($id, $data);
    }

    public function deletar($id)
    {
        return parent::delete($id);
    }

    public function listarPendentes()
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE status IN ('Pesando', 'Descarregando') 
                AND pesagem_final IS NULL
                ORDER BY criado_em DESC";
        $stmt = $this->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obterPorMotoristaEData($motorista_id, $data)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE motorista_id = :motorista_id 
                AND DATE(data_pesagem) = :data
                ORDER BY criado_em DESC
                LIMIT 1";
        $stmt = $this->query($sql, [
            'motorista_id' => $motorista_id,
            'data' => $data
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function listarPorMotorista($motorista_id, $limit = null, $offset = null)
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE motorista_id = :motorista_id
                ORDER BY data_pesagem DESC, hora_entrada DESC";
        
        if ($limit) {
            $sql .= " LIMIT :limit";
            if ($offset) {
                $sql .= " OFFSET :offset";
            }
        }

        $stmt = $this->query($sql, [
            'motorista_id' => $motorista_id,
            'limit' => $limit,
            'offset' => $offset
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
