<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Simple file-based form storage for webinar registration forms
$dataDir = __DIR__ . '/forms-data';
$formsFile = $dataDir . '/forms.json';
$settingsFile = $dataDir . '/settings.json';

// Ensure data directory exists
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($path === '/forms') {
                echo getForms();
            } elseif ($path === '/settings') {
                echo getSettings();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Not found']);
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if ($path === '/forms') {
                echo saveForms($input);
            } elseif ($path === '/settings') {
                echo saveSettings($input);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Not found']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function getForms() {
    global $formsFile;
    if (file_exists($formsFile)) {
        $content = file_get_contents($formsFile);
        return $content ?: '{}';
    }
    return '{}';
}

function saveForms($forms) {
    global $formsFile;
    if (file_put_contents($formsFile, json_encode($forms, JSON_PRETTY_PRINT))) {
        return json_encode(['success' => true]);
    }
    throw new Exception('Failed to save forms');
}

function getSettings() {
    global $settingsFile;
    if (file_exists($settingsFile)) {
        $content = file_get_contents($settingsFile);
        return $content ?: '{}';
    }
    return '{}';
}

function saveSettings($settings) {
    global $settingsFile;
    if (file_put_contents($settingsFile, json_encode($settings, JSON_PRETTY_PRINT))) {
        return json_encode(['success' => true]);
    }
    throw new Exception('Failed to save settings');
}
?>