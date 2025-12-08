<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;
use Kreait\Firebase\Exception\MessagingException;

class FcmService
{
    private $messaging;

    public function __construct()
    {
        try {
            $factory = new Factory();
            
            // Check if service account JSON is provided as string (for env vars)
            $serviceAccountJson = config('services.fcm.service_account_json');
            if ($serviceAccountJson) {
                $factory = $factory->withServiceAccount(json_decode($serviceAccountJson, true));
            } else {
                // Use service account file path
                $serviceAccountPath = config('services.fcm.service_account_path');
                if (!file_exists($serviceAccountPath)) {
                    Log::warning('Firebase service account file not found', [
                        'path' => $serviceAccountPath
                    ]);
                    return;
                }
                $factory = $factory->withServiceAccount($serviceAccountPath);
            }

            $this->messaging = $factory->createMessaging();
        } catch (\Throwable $e) {
            Log::error('Failed to initialize Firebase Admin SDK', [
                'error' => $e->getMessage(),
            ]);
            $this->messaging = null;
        }
    }

    /**
     * Send a push notification to all devices of a given user.
     */
    public function sendToUser(
        int $userId,
        string $title,
        string $body,
        array $data = []
    ): void {
        if (!$this->messaging) {
            Log::warning('FCM: Messaging not initialized, skipping push notification', [
                'user_id' => $userId
            ]);
            return;
        }

        $user = User::with('devices')->find($userId);
        if (!$user) {
            Log::warning('FCM: User not found', ['user_id' => $userId]);
            return;
        }

        $tokens = $user->devices()->pluck('fcm_token')->filter()->unique()->values()->all();
        if (empty($tokens)) {
            Log::info('FCM: No FCM tokens found for user', [
                'user_id' => $userId,
                'user_email' => $user->email
            ]);
            return;
        }

        Log::info('FCM: Sending push notification to user', [
            'user_id' => $userId,
            'token_count' => count($tokens),
            'title' => $title
        ]);

        $this->sendToTokens($tokens, $title, $body, $data);
    }

    /**
     * Send a push notification to a list of FCM tokens.
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): void
    {
        if (!$this->messaging) {
            Log::warning('Firebase messaging not initialized');
            return;
        }

        if (empty($tokens)) {
            return;
        }

        try {
            // Create notification payload
            $notification = FirebaseNotification::create($title, $body);
            
            // Build message data (convert all values to strings as FCM requires)
            $messageData = [];
            foreach ($data as $key => $value) {
                $messageData[$key] = is_string($value) ? $value : json_encode($value);
            }
            
            // Ensure title and body are also in data payload as fallback
            $messageData['title'] = $title;
            $messageData['body'] = $body;
            $messageData['message'] = $body; // Also include as 'message' for compatibility

            // Send to multiple tokens (batch send)
            // FCM allows up to 500 tokens per batch
            $batches = array_chunk($tokens, 500);
            
            foreach ($batches as $batch) {
                $message = CloudMessage::new()
                    ->withNotification($notification)
                    ->withData($messageData);

                $report = $this->messaging->sendMulticast($message, $batch);

                // Log results
                if ($report->hasFailures()) {
                    Log::warning('Some FCM notifications failed', [
                        'successes' => $report->successes()->count(),
                        'failures' => $report->failures()->count(),
                    ]);

                    // Optionally: Remove invalid tokens from database
                    foreach ($report->failures() as $failure) {
                        $token = $failure->target()->value();
                        $error = $failure->error();
                        
                        // Remove tokens that are invalid or unregistered
                        if ($error->getCode() === 'messaging/registration-token-not-registered' ||
                            $error->getCode() === 'messaging/invalid-registration-token') {
                            \App\Models\UserDevice::where('fcm_token', $token)->delete();
                            Log::info('Removed invalid FCM token', ['token' => substr($token, 0, 20) . '...']);
                        }
                    }
                } else {
                    Log::info('FCM: Push notifications sent successfully', [
                        'count' => $report->successes()->count(),
                        'title' => $title
                    ]);
                }
            }
        } catch (MessagingException $e) {
            Log::error('FCM messaging exception', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error sending FCM notification', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}
