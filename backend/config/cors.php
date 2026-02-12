<?php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    // Allow localhost for desktop development (with any port)
    'allowed_origins' => ['http://localhost:*', 'http://127.0.0.1:*', 'https://thrive360.site'],
    
    // Allow IP addresses for mobile device access (e.g., http://192.168.1.100:3000)
    // This pattern matches any IP address with any port
    'allowed_origins_patterns' => [
        '/^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/',
        // Also allow localhost with any port (for mobile view simulation)
        '/^http:\/\/localhost:\d+$/',
        '/^http:\/\/127\.0\.0\.1:\d+$/',
    ],
    
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];