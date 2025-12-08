<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase Cloud Messaging
    |--------------------------------------------------------------------------
    |
    | Service account JSON file path for Firebase Admin SDK.
    | Set FCM_SERVICE_ACCOUNT_PATH in your .env to the path of your service account JSON file.
    | Default: storage/app/firebase-service-account.json
    |
    | Alternatively, you can set FCM_SERVICE_ACCOUNT_JSON as a JSON string in .env
    | (useful for environment variables in cloud deployments).
    |
    */
    'fcm' => [
        'service_account_path' => env('FCM_SERVICE_ACCOUNT_PATH', storage_path('app/firebase-service-account.json')),
        'service_account_json' => env('FCM_SERVICE_ACCOUNT_JSON'), // Optional: JSON string instead of file path
    ],

];
