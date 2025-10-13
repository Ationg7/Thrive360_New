<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('password_reset_codes', function (Blueprint $table) {
            $table->string('code', 20)->change(); // Increase from 6 to 20 characters
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('password_reset_codes', function (Blueprint $table) {
            $table->string('code', 6)->change(); // Revert back to 6 characters
        });
    }
};
