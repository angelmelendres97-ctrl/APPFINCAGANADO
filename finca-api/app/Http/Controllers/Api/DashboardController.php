<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Lot;
use App\Models\MilkRecord;
use App\Models\Alert;
use App\Models\Event;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalAnimals = Animal::count();
        $activeAnimals = Animal::where('active', true)->count();
        $femaleCount = Animal::where('sex', 'female')->count();
        $maleCount = Animal::where('sex', 'male')->count();

        $totalLots = Lot::count();
        $activeLots = Lot::where('status', 'active')->count();

        $today = now()->toDateString();
        $todayMilkTotal = MilkRecord::whereDate('record_date', $today)->sum('quantity_liters');
        $animalsMilkingToday = MilkRecord::whereDate('record_date', $today)
            ->distinct('animal_id')
            ->count('animal_id');

        $activeAlerts = Alert::where('status', 'active')->count();
        $pendingEvents = Event::whereIn('status', ['scheduled', 'in_progress'])->count();

        $upcomingEvents = Event::with(['animal', 'eventType'])
            ->whereDate('event_date', '>=', $today)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('event_date')
            ->take(5)
            ->get();

        $recentAlerts = Alert::with(['animal', 'alertType'])
            ->orderBy('alert_date', 'desc')
            ->take(5)
            ->get();

        $monthlyProduction = MilkRecord::selectRaw(
            "DATE_FORMAT(record_date, '%Y-%m') as month, SUM(quantity_liters) as total_liters"
        )
            ->where('record_date', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'total_animals' => $totalAnimals,
            'active_animals' => $activeAnimals,
            'female_count' => $femaleCount,
            'male_count' => $maleCount,
            'sex_distribution' => [
                ['name' => 'Hembras', 'value' => $femaleCount],
                ['name' => 'Machos', 'value' => $maleCount],
            ],
            'total_lots' => $totalLots,
            'active_lots' => $activeLots,
            'today_milk_total' => (float) $todayMilkTotal,
            'animals_milking_today' => $animalsMilkingToday,
            'active_alerts' => $activeAlerts,
            'pending_events' => $pendingEvents,
            'upcoming_events' => $upcomingEvents,
            'recent_alerts' => $recentAlerts,
            'monthly_production' => $monthlyProduction,
        ]);
    }
}
