<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
        
        // Insert default settings
        $defaultSettings = [
            ['key' => 'site_name', 'value' => 'Thrive360', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'site_description', 'value' => 'Your wellness companion for a healthier lifestyle', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'theme', 'value' => 'light', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'maintenance_mode', 'value' => 'false', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'allow_registration', 'value' => 'true', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'email_notifications', 'value' => 'false', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'auto_backup', 'value' => 'false', 'created_at' => now(), 'updated_at' => now()],
        ];
        
        DB::table('settings')->insert($defaultSettings);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
