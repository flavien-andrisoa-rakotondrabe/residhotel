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
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('property_id'); // ID externe du bien
            $table->string('property_title');
            $table->string('property_image')->nullable();
            $table->string('property_location')->nullable();
            $table->decimal('property_price', 12, 2)->default(0);
            $table->float('property_rating')->default(0);
            $table->string('property_type')->nullable();
            $table->timestamps();

            // Index pour accélérer la recherche
            $table->unique(['user_id', 'property_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
