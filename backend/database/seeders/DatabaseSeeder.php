<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use App\Models\Job;
use App\Models\Item;
use App\Models\TrackingDetail;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@jobtracking.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create regular user
        User::create([
            'name' => 'Regular User',
            'email' => 'user@jobtracking.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // Create sample customers
        $customer1 = Customer::create([
            'customer_number' => 'CUST001',
            'name' => 'John Doe',
            'contact_number' => '+65 9123 4567',
        ]);

        $customer2 = Customer::create([
            'customer_number' => 'CUST002',
            'name' => 'Jane Smith',
            'contact_number' => '+65 8234 5678',
        ]);

        $customer3 = Customer::create([
            'customer_number' => 'CUST003',
            'name' => 'Tech Solutions Pte Ltd',
            'contact_number' => '+65 6345 6789',
        ]);

        // Create sample jobs
        $job1 = Job::create([
            'job_number' => 'JOB2024001',
            'customer_id' => $customer1->id,
            'original_case_number' => 'CASE-001',
            'clk_case_number' => 'CLK-001',
            'lk_shipped_date' => '2024-01-15',
            'lk_shipping_method' => 'Gomaz',
            'company_received_date' => '2024-01-20',
            'supplier_shipping_date' => '2024-01-22',
            'warehouse_received_date' => '2024-01-25',
            'received_confirmation_by' => 'Mr. Tan',
            'shipped_from_singapore_date' => '2024-01-27',
            'final_received_date' => '2024-01-30',
            'final_received_by_name' => 'John Doe',
            'received_confirmation' => true,
        ]);

        // Create items for job1
        Item::create([
            'job_id' => $job1->id,
            'name' => 'Laptop',
            'serial_number' => 'SN123456789',
        ]);

        Item::create([
            'job_id' => $job1->id,
            'name' => 'Monitor',
            'serial_number' => 'SN987654321',
        ]);

        // Create tracking details for job1
        TrackingDetail::create([
            'job_id' => $job1->id,
            'shipping_agent_name' => 'DHL Express',
            'tracking_number' => 'DHL123456789',
        ]);

        $job2 = Job::create([
            'job_number' => 'JOB2024002',
            'customer_id' => $customer2->id,
            'original_case_number' => 'CASE-002',
            'clk_case_number' => 'CLK-002',
            'lk_shipped_date' => '2024-02-01',
            'lk_shipping_method' => 'Direct',
            'company_received_date' => '2024-02-05',
            'supplier_shipping_date' => '2024-02-07',
            'warehouse_received_date' => '2024-02-10',
            'received_confirmation_by' => 'CLK Representative',
            'shipped_from_singapore_date' => null,
            'final_received_date' => null,
            'final_received_by_name' => null,
            'received_confirmation' => false,
        ]);

        Item::create([
            'job_id' => $job2->id,
            'name' => 'Smartphone',
            'serial_number' => 'SN111222333',
        ]);

        TrackingDetail::create([
            'job_id' => $job2->id,
            'shipping_agent_name' => 'FedEx',
            'tracking_number' => 'FDX987654321',
        ]);

        $job3 = Job::create([
            'job_number' => 'JOB2024003',
            'customer_id' => $customer3->id,
            'original_case_number' => 'CASE-003',
            'clk_case_number' => 'CLK-003',
            'lk_shipped_date' => '2024-03-01',
            'lk_shipping_method' => 'By hand',
            'company_received_date' => '2024-03-02',
            'supplier_shipping_date' => null,
            'warehouse_received_date' => null,
            'received_confirmation_by' => null,
            'shipped_from_singapore_date' => null,
            'final_received_date' => null,
            'final_received_by_name' => null,
            'received_confirmation' => false,
        ]);

        Item::create([
            'job_id' => $job3->id,
            'name' => 'Tablet',
            'serial_number' => 'SN444555666',
        ]);

        Item::create([
            'job_id' => $job3->id,
            'name' => 'Keyboard',
            'serial_number' => 'SN777888999',
        ]);

        Item::create([
            'job_id' => $job3->id,
            'name' => 'Mouse',
            'serial_number' => 'SN000111222',
        ]);

        TrackingDetail::create([
            'job_id' => $job3->id,
            'shipping_agent_name' => 'Hand Delivery',
            'tracking_number' => null,
        ]);
    }
}
