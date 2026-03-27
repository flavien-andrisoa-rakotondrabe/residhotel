<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class SettingService
{
    public static function getSettings(): array
    {
        // Récupère toutes les lignes et crée un tableau [clé => valeur]
        $rows = DB::table('platform_settings')->pluck('value', 'key');

        return [
            'travelerFeeRate'     => (float) ($rows['commission_traveler_pct'] ?? 10) / 100,
            'serviceFeeFixed'     => (float) ($rows['service_fee_fixed'] ?? 1.5),
            'hostCommissionRate'  => (float) ($rows['commission_host_pct'] ?? 10) / 100,
            'depositDefault'      => (float) ($rows['deposit_default_amount'] ?? 200),
            'currency'            => $rows['platform_currency'] ?? 'EUR',
            'platformName'        => $rows['platform_name'] ?? 'Residotel',
            'supportEmail'        => $rows['support_email'] ?? 'contact@residotel.com',
            'maxGuestsPerBooking' => (int) ($rows['max_guests_per_booking'] ?? 20),
        ];
    }
}
