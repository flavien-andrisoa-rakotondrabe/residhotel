<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function show(Property $property)
    {
        return Inertia::render('property/details', [
            'property' => $property
        ]);
    }
}
