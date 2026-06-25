<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'Finca',
            'email' => 'admin@finca.com',
            'password' => Hash::make('finca123'),
        ]);
    }
}