<?php

namespace App\Models;

use App\Config\Database;
use PDO;

abstract class Model
{
    protected $db;
    protected $table;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    protected function query($sql, $params = [])
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    protected function findById($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->query($sql, ['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    protected function findAll($limit = null, $offset = null)
    {
        $sql = "SELECT * FROM {$this->table}";
        
        if ($limit) {
            $sql .= " LIMIT :limit";
            if ($offset) {
                $sql .= " OFFSET :offset";
            }
        }

        $stmt = $this->query($sql, [
            'limit' => $limit,
            'offset' => $offset
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    protected function create($data)
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_map(fn($k) => ":$k", array_keys($data)));
        
        $sql = "INSERT INTO {$this->table} ($columns) VALUES ($placeholders) RETURNING id";
        $stmt = $this->query($sql, $data);
        
        return $stmt->fetch(PDO::FETCH_ASSOC)['id'];
    }

    protected function update($id, $data)
    {
        $set = implode(', ', array_map(fn($k) => "$k = :$k", array_keys($data)));
        $data['id'] = $id;
        
        $sql = "UPDATE {$this->table} SET $set WHERE id = :id";
        $this->query($sql, $data);
        
        return true;
    }

    protected function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = :id";
        $this->query($sql, ['id' => $id]);
        return true;
    }
}
