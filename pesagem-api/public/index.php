<?php

// Carregar variáveis de ambiente
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

// Autoload do Composer (ou fallback manual)
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
} else {
    // Autoload manual para desenvolvimento
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $base_dir = __DIR__ . '/../src/';

        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }

        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

        if (file_exists($file)) {
            require $file;
        }
    });
}

use App\Router;
use App\Controllers\AuthController;
use App\Controllers\PesagemController;
use App\Controllers\MotoristaController;
use App\Controllers\UsuarioController;

// Inicializar router
$router = new Router();

// Rotas de Autenticação
$router->post('/api/auth/login', function() {
    (new AuthController())->login();
});

$router->post('/api/auth/logout', function() {
    (new AuthController())->logout();
});

$router->get('/api/auth/verificar', function() {
    (new AuthController())->verificarToken();
});

// Rotas de Pesagens
$router->post('/api/pesagens', function() {
    (new PesagemController())->criar();
});

$router->get('/api/pesagens', function() {
    (new PesagemController())->listar();
});

$router->get('/api/pesagens/pendentes', function() {
    (new PesagemController())->listarPendentes();
});

$router->get('/api/pesagens/motorista', function() {
    (new PesagemController())->listarPorMotorista();
});

$router->get('/api/pesagens/{id}', function() {
    (new PesagemController())->obter();
});

$router->put('/api/pesagens/{id}', function() {
    (new PesagemController())->atualizar();
});

$router->delete('/api/pesagens/{id}', function() {
    (new PesagemController())->deletar();
});

// Rotas de Motoristas
$router->post('/api/motoristas', function() {
    (new MotoristaController())->criar();
});

$router->get('/api/motoristas', function() {
    (new MotoristaController())->listar();
});

$router->get('/api/motoristas/{id}', function() {
    (new MotoristaController())->obter();
});

$router->put('/api/motoristas/{id}', function() {
    (new MotoristaController())->atualizar();
});

$router->delete('/api/motoristas/{id}', function() {
    (new MotoristaController())->deletar();
});

// Rotas de Usuários (Admin)
$router->post('/api/usuarios', function() {
    (new UsuarioController())->criar();
});

$router->get('/api/usuarios', function() {
    (new UsuarioController())->listar();
});

$router->get('/api/usuarios/{id}', function() {
    (new UsuarioController())->obter();
});

$router->put('/api/usuarios/{id}', function() {
    (new UsuarioController())->atualizar();
});

$router->delete('/api/usuarios/{id}', function() {
    (new UsuarioController())->deletar();
});

// Rota de status
$router->get('/api/status', function() {
    \App\Response::success('API está funcionando', [
        'status' => 'online',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
});

// Dispatch
$router->dispatch();
