<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Http\Requests\RegisterRequest;
use App\DTOs\UserDTO;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    public function showAuth() {
        return Inertia::render('auth/index');
    }

    public function forgotPassword() {
        return Inertia::render('auth/forgot-password');
    }

    public function resetPassword() {
        return Inertia::render('auth/reset-password');
    }

    public function login(Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended('dashboard');
        }

        return back()->withErrors(['login_email' => 'Identifiants incorrects.']);
    }

    public function register(RegisterRequest $request): Response {
        $dto = UserDTO::fromRequest($request);

        $this->authService->register($dto);

        return back()->with('success', 'Successfully registered!');
    }
}
