<?php

namespace App\Models;

use PDO;

class Motorista extends Model
{
    protected $table = 'motoristas';

    public function listar()
    {
        return $this->findAll();
    }

    public function obterPorId($id)
    {
        return $this->findById($id);
    }

    public function criar($data)
    {
        $data['criado_em'] = date('Y-m-d H:i:s');
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

    public function findByDocumento($documento)
    {
        $sql = "SELECT * FROM {$this->table} WHERE documento = :documento";
        $stmt = $this->query($sql, ['documento' => $documento]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
