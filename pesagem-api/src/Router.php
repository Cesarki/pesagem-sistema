<?php

namespace App;

class Router
{
    private $routes = [];
    private $method;
    private $path;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $this->path = str_replace('/pesagem-api/public', '', $this->path);
    }

    public function post($route, $callback)
    {
        $this->addRoute('POST', $route, $callback);
    }

    public function get($route, $callback)
    {
        $this->addRoute('GET', $route, $callback);
    }

    public function put($route, $callback)
    {
        $this->addRoute('PUT', $route, $callback);
    }

    public function delete($route, $callback)
    {
        $this->addRoute('DELETE', $route, $callback);
    }

    private function addRoute($method, $route, $callback)
    {
        $this->routes[] = [
            'method' => $method,
            'route' => $route,
            'callback' => $callback
        ];
    }

    public function dispatch()
    {
        // Handle OPTIONS requests
        if ($this->method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        foreach ($this->routes as $route) {
            if ($route['method'] === $this->method && $this->matchRoute($route['route'])) {
                return call_user_func($route['callback']);
            }
        }

        Response::error('Rota não encontrada', 404);
    }

    private function matchRoute($route)
    {
        $routePattern = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '(?P<$1>[0-9]+)', $route);
        $routePattern = '#^' . $routePattern . '$#';

        if (preg_match($routePattern, $this->path, $matches)) {
            foreach ($matches as $key => $value) {
                if (!is_numeric($key)) {
                    $_GET[$key] = $value;
                }
            }
            return true;
        }

        return false;
    }
}
