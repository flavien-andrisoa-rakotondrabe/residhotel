<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    use HasFactory;

    /**
     * Les attributs pouvant être assignés massivement.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'price',
        'type',
        'bedrooms',
        'bathrooms',
        'guests',
        'amenities',
        'images',
        'image',
        'badge',
        'rating',
        'reviews',
        'active',
    ];

    /**
     * Les attributs qui doivent être transtypés (castés).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amenities' => 'array',   // Transforme le JSON en tableau PHP/JS
        'images'    => 'array',   // Transforme le JSON en tableau PHP/JS
        'active'    => 'boolean',
        'rating'    => 'float',
        'price'     => 'integer',
    ];

    /**
     * Obtient l'utilisateur (hôte) propriétaire de la propriété.
     * * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
