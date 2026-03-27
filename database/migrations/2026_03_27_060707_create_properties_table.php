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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();

            // Relation avec l'utilisateur (Propriétaire/Hôte)
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Informations principales
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location');
            $table->string('type'); // Ex: Maison, Appartement, Villa
            $table->integer('price');
            $table->string('badge')->nullable(); // Ex: "Coup de cœur", "Nouveau"

            // Détails techniques
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->integer('guests')->default(0);

            // Médias et Équipements (Stockés en JSON pour Inertia/React)
            $table->string('image')->nullable(); // Image principale (couverture)
            $table->json('images')->nullable();  // Galerie d'images
            $table->json('amenities')->nullable(); // Liste des équipements

            // Statistiques et État
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews')->default(0);
            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
