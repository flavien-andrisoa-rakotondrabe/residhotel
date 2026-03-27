<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['id', 'name']); // On enlève l'existant
        });

        Schema::table('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->first();
            $table->string('firstName')->after('id');
            $table->string('lastName')->after('firstName');
            $table->string('tel')->after('lastName');
            $table->enum('role', ['client', 'hote', 'admin'])->default('client')->after('password');
        });

        // Correction de la table sessions pour l'UUID
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });
        Schema::table('sessions', function (Blueprint $table) {
            $table->foreignUuid('user_id')->nullable()->index()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
