<?php

namespace App\Models;

use PDO;

class Usuario extends Model
{
    protected $table = 'usuarios';

    public function findByEmail($email)
    {
        $sql = "SELECT * FROM {$this->table} WHERE email = :email";
        $stmt = $this->query($sql, ['email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $data['senha'] = password_hash($data['senha'], PASSWORD_BCRYPT);
        $data['criado_em'] = date('Y-m-d H:i:s');
        
        return parent::create($data);
    }

    public function verificarSenha($senhaPlana, $senhaHash)
    {
        return password_verify($senhaPlana, $senhaHash);
    }

    public function listar()
    {
        return $this->findAll();
    }

    public function obterPorId($id)
    {
        return $this->findById($id);
    }
}
