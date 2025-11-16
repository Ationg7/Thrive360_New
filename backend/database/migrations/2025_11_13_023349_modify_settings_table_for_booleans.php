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
        // Update existing boolean string values to ensure they're stored correctly
        // Convert any existing 'true'/'false' strings to ensure consistency
        DB::table('settings')
            ->where('key', 'maintenance_mode')
            ->update(['value' => DB::raw("CASE WHEN value IN ('true', '1', 'on', 'yes') THEN 'true' ELSE 'false' END")]);
            
        DB::table('settings')
            ->where('key', 'allow_registration')
            ->update(['value' => DB::raw("CASE WHEN value IN ('true', '1', 'on', 'yes') THEN 'true' ELSE 'false' END")]);
            
        DB::table('settings')
            ->where('key', 'email_notifications')
            ->update(['value' => DB::raw("CASE WHEN value IN ('true', '1', 'on', 'yes') THEN 'true' ELSE 'false' END")]);
            
        DB::table('settings')
            ->where('key', 'auto_backup')
            ->update(['value' => DB::raw("CASE WHEN value IN ('true', '1', 'on', 'yes') THEN 'true' ELSE 'false' END")]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse - just normalizing values
    }
};
