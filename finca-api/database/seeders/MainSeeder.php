<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MainSeeder extends Seeder
{
    public function run()
    {
        // 1. Species (required for breeds and categories)
        $speciesIds = [];
        $speciesData = [
            ['name' => 'Bovino', 'scientific_name' => 'Bos taurus', 'description' => 'Ganado vacuno', 'active' => true],
            ['name' => 'Porcino', 'scientific_name' => 'Sus scrofa', 'description' => 'Ganado porcino', 'active' => true],
            ['name' => 'Caprino', 'scientific_name' => 'Capra hircus', 'description' => 'Ganado caprino', 'active' => true],
            ['name' => 'Equino', 'scientific_name' => 'Equus ferus', 'description' => 'Caballos', 'active' => true],
        ];
        
        foreach ($speciesData as $s) {
            $id = DB::table('species')->insertGetId($s);
            $speciesIds[$s['name']] = $id;
        }
        $this->command->info('Species created');

        // 2. Breeds
        $breedsData = [
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Holstein', 'description' => 'Raza lechera', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Jersey', 'description' => 'Raza lechera', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Brahman', 'description' => 'Raza cárnica', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Angus', 'description' => 'Raza cárnica', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Charolais', 'description' => 'Raza cárnica', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Simmental', 'description' => 'Raza dual', 'active' => true],
            ['species_id' => $speciesIds['Porcino'], 'name' => 'York', 'description' => 'Raza blanca', 'active' => true],
            ['species_id' => $speciesIds['Porcino'], 'name' => 'Landrace', 'description' => 'Raza blanca', 'active' => true],
            ['species_id' => $speciesIds['Porcino'], 'name' => 'Duroc', 'description' => 'Raza colorada', 'active' => true],
        ];
        
        foreach ($breedsData as $b) {
            DB::table('breeds')->insert($b);
        }
        $breedIds = array_values(DB::table('breeds')->pluck('id')->toArray());
        $this->command->info('Breeds created');

        // 3. Animal Categories
        $categoriesData = [
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Vaca en Producción', 'sex_applicability' => 'female', 'description' => 'Vacas lactando', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Vaca Seca', 'sex_applicability' => 'female', 'description' => 'Vacas en período seco', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Vaca Preñada', 'sex_applicability' => 'female', 'description' => 'Vacas preñadas', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Toro', 'sex_applicability' => 'male', 'description' => 'Toros', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Novillo', 'sex_applicability' => 'male', 'description' => 'Engorde', 'active' => true],
            ['species_id' => $speciesIds['Bovino'], 'name' => 'Becerro', 'sex_applicability' => 'both', 'description' => 'Cria joven', 'active' => true],
        ];
        
        foreach ($categoriesData as $c) {
            DB::table('animal_categories')->insert($c);
        }
        $categoryIds = array_values(DB::table('animal_categories')->pluck('id')->toArray());
        $this->command->info('Categories created');

        // 4. Animal Statuses (skip if exists)
        if (DB::table('animal_statuses')->count() == 0) {
            $statusesData = [
                ['name' => 'Activo', 'category' => 'productivo', 'description' => 'Activo', 'active' => true],
                ['name' => 'Seco', 'category' => 'productivo', 'description' => 'Período seco', 'active' => true],
                ['name' => 'En Observación', 'category' => 'special', 'description' => 'En observación', 'active' => true],
                ['name' => 'En Tratamiento', 'category' => 'sanitary', 'description' => 'Tratamiento', 'active' => true],
                ['name' => 'Preñado', 'category' => 'reproductive', 'description' => 'Preñado', 'active' => true],
                ['name' => 'En Crecimiento', 'category' => 'productivo', 'description' => 'Creciendo', 'active' => true],
            ];
            
            foreach ($statusesData as $s) {
                DB::table('animal_statuses')->insert($s);
            }
            $statusIds = array_values(DB::table('animal_statuses')->pluck('id')->toArray());
            $this->command->info('Statuses created');
        } else {
            $statusIds = array_values(DB::table('animal_statuses')->pluck('id')->toArray());
            $this->command->info('Statuses already exist, skipping');
        }

        // 5. Farms (skip if exists)
        if (!DB::table('farms')->exists()) {
            $farmId = DB::table('farms')->insertGetId([
                'name' => 'Finca La Esperanza',
                'business_name' => 'Ganadería La Esperanza',
                'owner_name' => 'Juan Pérez',
                'phone' => '55 5123 4567',
                'email' => 'info@finca.com',
                'country' => 'México',
                'province' => 'Jalisco',
                'city' => 'Guadalajara',
                'active' => true,
            ]);
            $this->command->info('Farm created');
        } else {
            $farmId = DB::table('farms')->first()->id;
            $this->command->info('Farm already exists, skipping');
        }

        // 6. User (skip if exists)
        if (!DB::table('users')->exists()) {
            $userId = DB::table('users')->insertGetId([
                'first_name' => 'Admin',
                'last_name' => 'Finca',
                'email' => 'admin@finca.com',
                'password' => Hash::make('finca123'),
                'status' => 'active',
            ]);
            $this->command->info('User created');
        } else {
            $userId = DB::table('users')->first()->id;
            $this->command->info('User already exists, skipping');
        }

        // 7. Lots (skip if exists)
        if (DB::table('lots')->count() == 0) {
            $lotsData = [
                ['farm_id' => $farmId, 'code' => 'PA', 'name' => 'Potrero A', 'type' => 'pasture', 'capacity' => 30, 'area_size' => 5.2, 'area_unit' => 'ha', 'status' => 'active'],
                ['farm_id' => $farmId, 'code' => 'PB', 'name' => 'Potrero B', 'type' => 'pasture', 'capacity' => 25, 'area_size' => 4.5, 'area_unit' => 'ha', 'status' => 'active'],
                ['farm_id' => $farmId, 'code' => 'CA', 'name' => 'Corral A', 'type' => 'corral', 'capacity' => 50, 'area_size' => 1.5, 'area_unit' => 'ha', 'status' => 'active'],
                ['farm_id' => $farmId, 'code' => 'CB', 'name' => 'Corral B', 'type' => 'corral', 'capacity' => 30, 'area_size' => 1.0, 'area_unit' => 'ha', 'status' => 'active'],
            ];
            
            foreach ($lotsData as $l) {
                DB::table('lots')->insert($l);
            }
            $lotIds = array_values(DB::table('lots')->pluck('id')->toArray());
            $this->command->info('Lots created');
        } else {
            $lotIds = array_values(DB::table('lots')->pluck('id')->toArray());
            $this->command->info('Lots already exist, skipping');
        }

        // 8. Animals (skip if exists)
        if (DB::table('animals')->count() == 0) {
            $animalsData = [
                ['farm_id' => $farmId, 'internal_code' => 'FIN001', 'name' => 'Luna', 'sex' => 'female', 'breed_id' => $breedIds[0], 'category_id' => $categoryIds[0], 'status_id' => $statusIds[0], 'lot_id' => $lotIds[0], 'birth_date' => '2021-03-15', 'weight_current' => 550, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN002', 'name' => 'Estrella', 'sex' => 'female', 'breed_id' => $breedIds[0], 'category_id' => $categoryIds[0], 'status_id' => $statusIds[0], 'lot_id' => $lotIds[0], 'birth_date' => '2021-05-20', 'weight_current' => 580, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN003', 'name' => 'Tormenta', 'sex' => 'female', 'breed_id' => $breedIds[1], 'category_id' => $categoryIds[1], 'status_id' => $statusIds[1], 'lot_id' => $lotIds[0], 'birth_date' => '2020-08-10', 'weight_current' => 520, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN004', 'name' => 'Rayo', 'sex' => 'male', 'breed_id' => $breedIds[2], 'category_id' => $categoryIds[3], 'status_id' => $statusIds[0], 'lot_id' => $lotIds[1], 'birth_date' => '2019-02-28', 'weight_current' => 850, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN005', 'name' => 'Nieve', 'sex' => 'female', 'breed_id' => $breedIds[0], 'category_id' => $categoryIds[2], 'status_id' => $statusIds[4], 'lot_id' => $lotIds[0], 'birth_date' => '2022-01-15', 'weight_current' => 510, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN006', 'name' => 'Relámpago', 'sex' => 'male', 'breed_id' => $breedIds[3], 'category_id' => $categoryIds[4], 'status_id' => $statusIds[5], 'lot_id' => $lotIds[2], 'birth_date' => '2023-03-20', 'weight_current' => 380, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN007', 'name' => 'Dolores', 'sex' => 'female', 'breed_id' => $breedIds[0], 'category_id' => $categoryIds[0], 'status_id' => $statusIds[0], 'lot_id' => $lotIds[1], 'birth_date' => '2021-07-08', 'weight_current' => 545, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN008', 'name' => 'Trueno', 'sex' => 'male', 'breed_id' => $breedIds[4], 'category_id' => $categoryIds[4], 'status_id' => $statusIds[5], 'lot_id' => $lotIds[2], 'birth_date' => '2023-05-12', 'weight_current' => 350, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN009', 'name' => 'Blanca', 'sex' => 'female', 'breed_id' => $breedIds[1], 'category_id' => $categoryIds[0], 'status_id' => $statusIds[0], 'lot_id' => $lotIds[0], 'birth_date' => '2022-02-14', 'weight_current' => 490, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN010', 'name' => 'Negra', 'sex' => 'female', 'breed_id' => $breedIds[0], 'category_id' => $categoryIds[5], 'status_id' => $statusIds[5], 'lot_id' => $lotIds[1], 'birth_date' => '2024-01-05', 'weight_current' => 180, 'active' => true],
            ];
            
            foreach ($animalsData as $a) {
                DB::table('animals')->insert($a);
            }
            $animalIds = array_values(DB::table('animals')->pluck('id')->toArray());
            $this->command->info('Animals created: ' . count($animalsData));
        } else {
            $animalIds = array_values(DB::table('animals')->pluck('id')->toArray());
            $this->command->info('Animals already exist, skipping');
        }

        // 9. Milk Records (skip if exists)
        if (DB::table('milk_records')->count() == 0) {
            $milkRecords = [];
            foreach (range(0, 2) as $day) {
                $date = date('Y-m-d', strtotime("-{$day} days"));
                foreach ([1 => 'morning', 2 => 'afternoon'] as $session) {
                    foreach ($animalIds as $animalId) {
                        $milkRecords[] = [
                            'animal_id' => $animalId,
                            'record_date' => $date,
                            'milking_session' => $session,
                            'quantity_liters' => rand(12, 25) + (rand(0, 10) / 10),
                            'temperature' => 36.0 + (rand(0, 15) / 10),
                            'mastitis_check' => rand(1, 10) > 8,
                            'created_by' => $userId,
                        ];
                    }
                }
            }
            
            foreach ($milkRecords as $m) {
                DB::table('milk_records')->insert($m);
            }
            $this->command->info('Milk records created');
        } else {
            $this->command->info('Milk records already exist, skipping');
        }

        // 10. Health Types (skip if exists)
        if (DB::table('health_types')->count() == 0) {
            $healthTypes = [
                ['name' => 'Vacuna', 'description' => 'Vacunación', 'active' => true],
                ['name' => 'Desparasitación', 'description' => 'Desparasitación', 'active' => true],
                ['name' => 'Enfermedad', 'description' => 'Tratamiento enfermedad', 'active' => true],
                ['name' => 'Tratamiento', 'description' => 'Tratamiento médico', 'active' => true],
                ['name' => 'Revisión', 'description' => 'Revisión veterinaria', 'active' => true],
            ];
            
            foreach ($healthTypes as $ht) {
                DB::table('health_types')->insert($ht);
            }
            $healthTypeIds = array_values(DB::table('health_types')->pluck('id')->toArray());
            $this->command->info('Health types created');
        } else {
            $healthTypeIds = array_values(DB::table('health_types')->pluck('id')->toArray());
            $this->command->info('Health types already exist, skipping');
        }

        // 11. Health Records (skip if exists)
        if (DB::table('health_records')->count() == 0) {
            $healthRecords = [
                ['animal_id' => $animalIds[0], 'health_type_id' => $healthTypeIds[0], 'record_date' => date('Y-m-d', strtotime('-30 days')), 'diagnosis' => 'Vacuna aftosa', 'medication_name' => 'Fiebre Aftosa', 'dosage' => 2.00, 'dosage_unit' => 'ml', 'veterinarian_name' => 'Dr. Martínez', 'response_status' => 'resolved'],
                ['animal_id' => $animalIds[1], 'health_type_id' => $healthTypeIds[0], 'record_date' => date('Y-m-d', strtotime('-45 days')), 'diagnosis' => 'Vacuna brucelosis', 'medication_name' => 'Brucelosis', 'dosage' => 5.00, 'dosage_unit' => 'ml', 'veterinarian_name' => 'Dr. Martínez', 'response_status' => 'resolved'],
                ['animal_id' => $animalIds[2], 'health_type_id' => $healthTypeIds[1], 'record_date' => date('Y-m-d', strtotime('-15 days')), 'diagnosis' => 'Desparasitación', 'medication_name' => 'Albendazol', 'dosage' => 10.00, 'dosage_unit' => 'ml', 'veterinarian_name' => 'Dr. López', 'response_status' => 'resolved'],
            ];
            
            foreach ($healthRecords as $hr) {
                DB::table('health_records')->insert($hr);
            }
            $this->command->info('Health records created');
        } else {
            $this->command->info('Health records already exist, skipping');
        }

// 12. Event Types (skip if exists)
        if (DB::table('event_types')->count() == 0) {
            $eventTypes = [
                ['name' => 'Nacimiento', 'scope' => 'animal', 'description' => 'Nacimiento', 'active' => true],
                ['name' => 'Pesaje', 'scope' => 'animal', 'description' => 'Control de peso', 'active' => true],
                ['name' => 'Vacunación', 'scope' => 'animal', 'description' => 'Vacunación', 'active' => true],
                ['name' => 'Parto', 'scope' => 'animal', 'description' => 'Parto', 'active' => true],
                ['name' => 'Rotación', 'scope' => 'lot', 'description' => 'Rotación potrero', 'active' => true],
                ['name' => 'Recordatorio', 'scope' => 'general', 'description' => 'Recordatorio', 'active' => true],
            ];
            
            foreach ($eventTypes as $et) {
                DB::table('event_types')->insert($et);
            }
            $eventTypeIds = array_values(DB::table('event_types')->pluck('id')->toArray());
            $this->command->info('Event types created');
        } else {
            $eventTypeIds = array_values(DB::table('event_types')->pluck('id')->toArray());
            $this->command->info('Event types already exist, skipping');
        }

        // 13. Events (skip if exists)
        if (DB::table('events')->count() == 0) {
            $events = [
                ['farm_id' => $farmId, 'event_type_id' => $eventTypeIds[0], 'title' => 'Control reproductivo', 'description' => 'Revisión de celo', 'event_date' => date('Y-m-d', strtotime('+5 days')), 'priority' => 'low', 'status' => 'scheduled'],
                ['farm_id' => $farmId, 'event_type_id' => $eventTypeIds[3], 'title' => 'Parto esperado', 'description' => 'Fecha probable', 'event_date' => date('Y-m-d', strtotime('+30 days')), 'priority' => 'high', 'status' => 'scheduled'],
            ];
            
            foreach ($events as $e) {
                DB::table('events')->insert($e);
            }
            $this->command->info('Events created');
        } else {
            $this->command->info('Events already exist, skipping');
        }

        // 14. Reproductive Types (skip if exists)
        if (DB::table('reproductive_types')->count() == 0) {
            $reproductiveTypes = [
                ['name' => 'Inseminación artificial', 'description' => 'IA', 'active' => true],
                ['name' => 'Monta natural', 'description' => 'MN', 'active' => true],
                ['name' => 'Embrión', 'description' => 'TE', 'active' => true],
                ['name' => 'Diagnóstico preñez', 'description' => 'DP', 'active' => true],
                ['name' => 'Parto', 'description' => 'PT', 'active' => true],
            ];
            foreach ($reproductiveTypes as $rt) {
                DB::table('reproductive_types')->insert($rt);
            }
            $reproductiveTypeIds = array_values(DB::table('reproductive_types')->pluck('id')->toArray());
            $this->command->info('Reproductive types created');
        } else {
            $reproductiveTypeIds = array_values(DB::table('reproductive_types')->pluck('id')->toArray());
            $this->command->info('Reproductive types already exist, skipping');
        }

        // 15. Reproductive Records
        if (DB::table('reproductive_records')->count() == 0) {
            $reproductiveRecords = [
                ['animal_id' => $animalIds[0], 'reproductive_type_id' => $reproductiveTypeIds[0], 'event_date' => date('Y-m-d', strtotime('-60 days')), 'result' => 'positive', 'offspring_count' => 1, 'created_by' => $userId],
                ['animal_id' => $animalIds[2], 'reproductive_type_id' => $reproductiveTypeIds[3], 'event_date' => date('Y-m-d', strtotime('-30 days')), 'result' => 'positive', 'created_by' => $userId],
            ];
            foreach ($reproductiveRecords as $rr) {
                DB::table('reproductive_records')->insert($rr);
            }
            $this->command->info('Reproductive records created');
        } else {
            $this->command->info('Reproductive records already exist, skipping');
        }

        // 16. Feeds (skip if exists)
        if (DB::table('feeds')->count() == 0) {
            $feeds = [
                ['farm_id' => $farmId, 'name' => 'Concentrado Premium', 'feed_type' => 'concentrate', 'measurement_unit' => 'kg', 'stock_quantity' => 500, 'minimum_stock' => 100, 'active' => true],
                ['farm_id' => $farmId, 'name' => 'Alfalfa', 'feed_type' => 'forage', 'measurement_unit' => 'kg', 'stock_quantity' => 1000, 'minimum_stock' => 200, 'active' => true],
                ['farm_id' => $farmId, 'name' => 'Minerales', 'feed_type' => 'mineral', 'measurement_unit' => 'kg', 'stock_quantity' => 50, 'minimum_stock' => 10, 'active' => true],
                ['farm_id' => $farmId, 'name' => 'Sales', 'feed_type' => 'supplement', 'measurement_unit' => 'kg', 'stock_quantity' => 30, 'minimum_stock' => 5, 'active' => true],
            ];
            foreach ($feeds as $f) {
                DB::table('feeds')->insert($f);
            }
            $feedIds = array_values(DB::table('feeds')->pluck('id')->toArray());
            $this->command->info('Feeds created');
        } else {
            $feedIds = array_values(DB::table('feeds')->pluck('id')->toArray());
            $this->command->info('Feeds already exist, skipping');
        }

        // 17. Feeding Records
        if (DB::table('animal_feeding_records')->count() == 0) {
            foreach ($animalIds as $animalId) {
                DB::table('animal_feeding_records')->insert([
                    'animal_id' => $animalId,
                    'feed_id' => $feedIds[0],
                    'feeding_date' => date('Y-m-d'),
                    'quantity' => rand(2, 5),
                    'unit' => 'kg',
                    'frequency' => 'daily',
                    'created_by' => $userId,
                ]);
            }
            $this->command->info('Feeding records created');
        } else {
            $this->command->info('Feeding records already exist, skipping');
        }

        // 18. Alert Types (skip if exists)
        if (DB::table('alert_types')->count() == 0) {
            $alertTypes = [
                ['name' => 'Salud', 'description' => 'Alerta sanitaria', 'active' => true],
                ['name' => 'Alimento', 'description' => 'Stock bajo de alimento', 'active' => true],
                ['name' => 'Peso', 'description' => 'ontrol de peso', 'active' => true],
                ['name' => 'Reproducción', 'description' => 'Alerta reproductiva', 'active' => true],
            ];
            foreach ($alertTypes as $at) {
                DB::table('alert_types')->insert($at);
            }
            $alertTypeIds = array_values(DB::table('alert_types')->pluck('id')->toArray());
            $this->command->info('Alert types created');
        } else {
            $alertTypeIds = array_values(DB::table('alert_types')->pluck('id')->toArray());
            $this->command->info('Alert types already exist, skipping');
        }

        // 19. Alerts
        if (DB::table('alerts')->count() == 0) {
            $alerts = [
                ['farm_id' => $farmId, 'animal_id' => $animalIds[0], 'alert_type_id' => $alertTypeIds[0], 'title' => 'Vacuna pendiente', 'message' => 'Vacuna aftosa vencida', 'alert_date' => date('Y-m-d'), 'priority' => 'medium', 'status' => 'active'],
                ['farm_id' => $farmId, 'animal_id' => $animalIds[1], 'alert_type_id' => $alertTypeIds[2], 'title' => 'Control de peso', 'message' => 'Peso bajo del normal', 'alert_date' => date('Y-m-d'), 'priority' => 'low', 'status' => 'active'],
            ];
            foreach ($alerts as $a) {
                DB::table('alerts')->insert($a);
            }
            $this->command->info('Alerts created');
        } else {
            $this->command->info('Alerts already exist, skipping');
        }

        // 20. Animal Categories for other species
        if (DB::table('animal_categories')->count() <= 6) {
            $moreCategories = [
                ['species_id' => $speciesIds['Porcino'], 'name' => 'Cerda gestante', 'sex_applicability' => 'female', 'description' => 'Cerda preñada', 'active' => true],
                ['species_id' => $speciesIds['Porcino'], 'name' => 'Cerdo en acabado', 'sex_applicability' => 'male', 'description' => 'Engorde', 'active' => true],
                ['species_id' => $speciesIds['Caprino'], 'name' => 'Cabra lactante', 'sex_applicability' => 'female', 'description' => 'Cabra en producción', 'active' => true],
                ['species_id' => $speciesIds['Equino'], 'name' => 'Caballo adulto', 'sex_applicability' => 'both', 'description' => 'Equino adulto', 'active' => true],
            ];
            foreach ($moreCategories as $c) {
                DB::table('animal_categories')->insert($c);
            }
            $this->command->info('More categories created');
        }

        // 21. More animals for other species
        if (DB::table('animals')->count() <= 10) {
            $farmId = DB::table('farms')->first()->id;
            $allCategoryIds = array_values(DB::table('animal_categories')->pluck('id')->toArray());
            $allBreedIds = array_values(DB::table('breeds')->pluck('id')->toArray());
            $allLotIds = array_values(DB::table('lots')->pluck('id')->toArray());
            $allStatusIds = array_values(DB::table('animal_statuses')->pluck('id')->toArray());
            
            $moreAnimals = [
                ['farm_id' => $farmId, 'internal_code' => 'FIN011', 'name' => 'Rosa', 'sex' => 'female', 'breed_id' => $allBreedIds[6], 'category_id' => $allCategoryIds[6], 'status_id' => $allStatusIds[0], 'lot_id' => $allLotIds[0], 'birth_date' => '2022-03-10', 'weight_current' => 120, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN012', 'name' => 'Pepito', 'sex' => 'male', 'breed_id' => $allBreedIds[7], 'category_id' => $allCategoryIds[7], 'status_id' => $allStatusIds[5], 'lot_id' => $allLotIds[2], 'birth_date' => '2023-06-15', 'weight_current' => 80, 'active' => true],
                ['farm_id' => $farmId, 'internal_code' => 'FIN013', 'name' => 'Luna', 'sex' => 'female', 'breed_id' => $allBreedIds[8], 'category_id' => $allCategoryIds[8], 'status_id' => $allStatusIds[0], 'lot_id' => $allLotIds[1], 'birth_date' => '2021-09-20', 'weight_current' => 350, 'active' => true],
            ];
            foreach ($moreAnimals as $a) {
                DB::table('animals')->insert($a);
            }
            $this->command->info('More animals created');
        }

        // 22. More lots
        if (DB::table('lots')->count() <= 4) {
            $moreLots = [
                ['farm_id' => $farmId, 'code' => 'PC', 'name' => 'Potrero C', 'type' => 'pasture', 'capacity' => 20, 'area_size' => 3.0, 'area_unit' => 'ha', 'status' => 'active'],
                ['farm_id' => $farmId, 'code' => 'CC', 'name' => 'Corral C', 'type' => 'corral', 'capacity' => 40, 'area_size' => 2.0, 'area_unit' => 'ha', 'status' => 'active'],
            ];
            foreach ($moreLots as $l) {
                DB::table('lots')->insert($l);
            }
            $this->command->info('More lots created');
        }

        $this->command->info('=== Seed completed! ===');
        $this->command->info('Login: admin@finca.com / finan123');
    }
}