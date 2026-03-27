<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'firstName' => 'required|string|max:50',
            'lastName' => 'required|string|max:50',
            'tel' => 'required|string|min:10',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
            'role' => 'required|in:client,hote',
        ];
    }

    /**
     * Personalize message
     */
    public function messages(): array
    {

        return [
            'firstName.required' => __('auth.register.firstName_required'),
            'lastName.required' =>  __('auth.register.lastName_required'),
            'tel.required' =>  __('auth.register.tel_required'),
            'tel.min' =>  __('auth.register.tel_min'),
            'email.required' =>  __('auth.register.email_required'),
            'email.email' =>  __('auth.register.email_invalid'),
            'email.unique' => __('auth.register.email_exists'),
            'password.required' => __('auth.register.password_required'),
            'password.min' => __('auth.register.password_min'),
            'password.confirmed' =>  __('auth.register.password_match'),
        ];
    }
}
