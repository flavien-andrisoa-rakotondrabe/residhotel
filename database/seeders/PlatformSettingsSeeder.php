<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class PlatformSettingsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $settings = [
            'commission_traveler_pct' => '10',
            'service_fee_fixed'        => '1.5',
            'commission_host_pct'      => '10',
            'deposit_default_amount'   => '200',
            'platform_currency'        => 'EUR',
            'platform_name'            => 'Residotel',
            'support_email'            => 'contact@residotel.com',
            'max_guests_per_booking'   => '20',
        ];

        foreach ($settings as $key => $value) {
            \DB::table('platform_settings')->updateOrInsert(['key' => $key], ['value' => $value]);
        }
    }
}
