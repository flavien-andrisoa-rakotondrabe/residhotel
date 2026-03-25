<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function toggle(Request $request)
    {
        $data = $request->validate([
            'property_id' => 'required|string',
            'property_title' => 'required|string',
            'property_image' => 'nullable|string',
            'property_location' => 'nullable|string',
            'property_price' => 'numeric',
            'property_rating' => 'numeric',
            'property_type' => 'nullable|string',
        ]);

        $favorite = Favorite::where('user_id', Auth::id())
            ->where('property_id', $data['property_id'])
            ->first();

        if ($favorite) {
            $favorite->delete();
            return back(); // Inertia rechargera les données automatiquement
        }

        Favorite::create(array_merge($data, ['user_id' => Auth::id()]));

        return back();
    }
}
