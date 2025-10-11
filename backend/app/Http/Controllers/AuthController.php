<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'email'    => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            // Create user
            $user = User::create([
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'user', // Set default role
                'is_active' => true,  // Set default active status
            ]);

            // Create token for the user
            $token = $user->createToken('auth-token')->plainTextToken;

            \Log::info('User created successfully', ['user_id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'message' => 'User registered successfully!',
                'token'   => $token,
                'user'    => $user
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Database error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            // Validate input
            $validator = Validator::make($request->all(), [
                'email'    => 'required|string|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            // Attempt to authenticate
            if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
                $user = Auth::user();
                
                // Create token for the user
                $token = $user->createToken('auth-token')->plainTextToken;
                
                \Log::info('User logged in successfully', ['user_id' => $user->id, 'email' => $user->email]);

                return response()->json([
                    'message' => 'Login successful!',
                    'token'   => $token,
                    'user'    => $user
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

        } catch (\Exception $e) {
            \Log::error('Login failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Login error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeMeditation(Request $request) {
        // Validate and store meditation logic here
    }

    /**
     * Send a password reset link to the given email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 200);
        }

        return response()->json(['message' => __($status)], 400);
    }

    /**
     * Handle resetting the user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)], 200);
        }

        return response()->json(['message' => __($status)], 400);
    }
}
