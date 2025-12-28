<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search for jobs by job number, customer name, or customer phone
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1',
        ]);

        $query = $request->input('query');
        $status = $request->input('status');

        // Advanced filter parameters (available to all roles)
        $originalCaseNumber = $request->input('original_case_number');
        $clkCaseNumber = $request->input('clk_case_number');
        $companyName = $request->input('company_name');
        $lkShippedDateFrom = $request->input('lk_shipped_date_from');
        $lkShippedDateTo = $request->input('lk_shipped_date_to');
        $companyReceivedDateFrom = $request->input('company_received_date_from');
        $companyReceivedDateTo = $request->input('company_received_date_to');
        $supplierShippingDateFrom = $request->input('supplier_shipping_date_from');
        $supplierShippingDateTo = $request->input('supplier_shipping_date_to');
        $trackingNumber = $request->input('tracking_number');
        $warehouseReceivedDateFrom = $request->input('warehouse_received_date_from');
        $warehouseReceivedDateTo = $request->input('warehouse_received_date_to');
        $shippedFromSgDateFrom = $request->input('shipped_from_sg_date_from');
        $shippedFromSgDateTo = $request->input('shipped_from_sg_date_to');
        $finalReceivedDateFrom = $request->input('final_received_date_from');
        $finalReceivedDateTo = $request->input('final_received_date_to');

        // Search by job number, customer name, customer phone, original case number, or CLK case number
        $jobsQuery = Job::with(['customer', 'items', 'trackingDetails'])
            ->latest()
            ->where(function($q) use ($query) {
                $q->where('job_number', 'LIKE', "%{$query}%")
                  ->orWhere('original_case_number', 'LIKE', "%{$query}%")
                  ->orWhere('clk_case_number', 'LIKE', "%{$query}%")
                  ->orWhereHas('customer', function ($customerQuery) use ($query) {
                      $customerQuery->where('contact_number', 'LIKE', "%{$query}%")
                                   ->orWhere('name', 'LIKE', "%{$query}%");
                  });
            });

        // Apply advanced filters
        if ($originalCaseNumber && $originalCaseNumber !== '') {
            $jobsQuery->where('original_case_number', 'LIKE', "%{$originalCaseNumber}%");
        }

        if ($clkCaseNumber && $clkCaseNumber !== '') {
            $jobsQuery->where('clk_case_number', 'LIKE', "%{$clkCaseNumber}%");
        }

        if ($companyName && $companyName !== '') {
            $jobsQuery->where('company_name', 'LIKE', "%{$companyName}%");
        }

        if ($lkShippedDateFrom && $lkShippedDateFrom !== '') {
            $jobsQuery->where('lk_shipped_date', '>=', $lkShippedDateFrom);
        }

        if ($lkShippedDateTo && $lkShippedDateTo !== '') {
            $jobsQuery->where('lk_shipped_date', '<=', $lkShippedDateTo);
        }

        if ($companyReceivedDateFrom && $companyReceivedDateFrom !== '') {
            $jobsQuery->where('company_received_date', '>=', $companyReceivedDateFrom);
        }

        if ($companyReceivedDateTo && $companyReceivedDateTo !== '') {
            $jobsQuery->where('company_received_date', '<=', $companyReceivedDateTo);
        }

        if ($supplierShippingDateFrom && $supplierShippingDateFrom !== '') {
            $jobsQuery->where('supplier_shipping_date', '>=', $supplierShippingDateFrom);
        }

        if ($supplierShippingDateTo && $supplierShippingDateTo !== '') {
            $jobsQuery->where('supplier_shipping_date', '<=', $supplierShippingDateTo);
        }

        if ($trackingNumber && $trackingNumber !== '') {
            $jobsQuery->whereHas('trackingDetails', function($q) use ($trackingNumber) {
                $q->where('tracking_number', 'LIKE', "%{$trackingNumber}%");
            });
        }

        if ($warehouseReceivedDateFrom && $warehouseReceivedDateFrom !== '') {
            $jobsQuery->where('warehouse_received_date', '>=', $warehouseReceivedDateFrom);
        }

        if ($warehouseReceivedDateTo && $warehouseReceivedDateTo !== '') {
            $jobsQuery->where('warehouse_received_date', '<=', $warehouseReceivedDateTo);
        }

        if ($shippedFromSgDateFrom && $shippedFromSgDateFrom !== '') {
            $jobsQuery->where('shipped_from_singapore_date', '>=', $shippedFromSgDateFrom);
        }

        if ($shippedFromSgDateTo && $shippedFromSgDateTo !== '') {
            $jobsQuery->where('shipped_from_singapore_date', '<=', $shippedFromSgDateTo);
        }

        if ($finalReceivedDateFrom && $finalReceivedDateFrom !== '') {
            $jobsQuery->where('final_received_date', '>=', $finalReceivedDateFrom);
        }

        if ($finalReceivedDateTo && $finalReceivedDateTo !== '') {
            $jobsQuery->where('final_received_date', '<=', $finalReceivedDateTo);
        }

        // Filter by status if provided (only for non-viewers)
        if ($status && $status !== '') {
            switch ($status) {
                case 'Job Completed':
                    $jobsQuery->whereNotNull('final_received_date');
                    break;
                    
                case 'Shipping Arranged from Singapore':
                    $jobsQuery->whereNotNull('shipped_from_singapore_date')
                              ->whereNull('final_received_date');
                    break;
                    
                case 'Received by CameraLK Representative':
                    $jobsQuery->whereNotNull('clk_received_date')
                              ->whereNull('shipped_from_singapore_date')
                              ->whereNull('final_received_date');
                    break;
                    
                case 'Received to Singapore':
                    $jobsQuery->whereNotNull('warehouse_received_date')
                              ->whereNull('clk_received_date')
                              ->whereNull('shipped_from_singapore_date')
                              ->whereNull('final_received_date');
                    break;
                    
                case 'Supplier Shipped':
                    $jobsQuery->whereNotNull('supplier_shipping_date')
                              ->whereNull('warehouse_received_date')
                              ->whereNull('clk_received_date')
                              ->whereNull('shipped_from_singapore_date')
                              ->whereNull('final_received_date');
                    break;
                    
                case 'Received to Company':
                    $jobsQuery->whereNotNull('company_received_date')
                              ->whereNull('supplier_shipping_date')
                              ->whereNull('warehouse_received_date')
                              ->whereNull('clk_received_date')
                              ->whereNull('shipped_from_singapore_date')
                              ->whereNull('final_received_date');
                    break;
                    
                case 'Shipped from CameraLK':
                    $jobsQuery->whereNotNull('lk_shipped_date')
                              ->whereNull('company_received_date')
                              ->whereNull('supplier_shipping_date')
                              ->whereNull('warehouse_received_date')
                              ->whereNull('clk_received_date')
                              ->whereNull('shipped_from_singapore_date')
                              ->whereNull('final_received_date');
                    break;
                    
                case 'Ongoing Job':
                    $jobsQuery->whereNull('lk_shipped_date')
                              ->whereNull('company_received_date')
                              ->whereNull('supplier_shipping_date')
                              ->whereNull('warehouse_received_date')
                              ->whereNull('clk_received_date')
                              ->whereNull('shipped_from_singapore_date')
                              ->whereNull('final_received_date');
                    break;
            }
        }

        $jobs = $jobsQuery->paginate(10);

        return response()->json($jobs);
    }

    /**
     * Get autocomplete suggestions for search
     */
    public function suggestions(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1',
        ]);

        $query = $request->input('query');
        $limit = $request->input('limit', 10);

        // Get matching job numbers
        $jobNumbers = Job::where('job_number', 'LIKE', "%{$query}%")
            ->limit($limit)
            ->pluck('job_number')
            ->unique()
            ->values();

        // Get matching customer names
        $customerNames = Job::with('customer')
            ->whereHas('customer', function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%");
            })
            ->limit($limit)
            ->get()
            ->pluck('customer.name')
            ->unique()
            ->values();

        // Get matching phone numbers
        $phoneNumbers = Job::with('customer')
            ->whereHas('customer', function($q) use ($query) {
                $q->where('contact_number', 'LIKE', "%{$query}%");
            })
            ->limit($limit)
            ->get()
            ->pluck('customer.contact_number')
            ->unique()
            ->values();

        // Get matching original case numbers
        $originalCaseNumbers = Job::where('original_case_number', 'LIKE', "%{$query}%")
            ->whereNotNull('original_case_number')
            ->where('original_case_number', '!=', '')
            ->limit($limit)
            ->pluck('original_case_number')
            ->unique()
            ->values();

        // Get matching CLK case numbers
        $clkCaseNumbers = Job::where('clk_case_number', 'LIKE', "%{$query}%")
            ->whereNotNull('clk_case_number')
            ->where('clk_case_number', '!=', '')
            ->limit($limit)
            ->pluck('clk_case_number')
            ->unique()
            ->values();

        return response()->json([
            'job_numbers' => $jobNumbers,
            'customer_names' => $customerNames,
            'phone_numbers' => $phoneNumbers,
            'original_case_numbers' => $originalCaseNumbers,
            'clk_case_numbers' => $clkCaseNumbers,
        ]);
    }

    /**
     * Get job by ID with all related data
     */
    public function show($id)
    {
        $job = Job::with(['customer', 'items', 'trackingDetails'])->findOrFail($id);

        return response()->json($job);
    }

    /**
     * Get all jobs (accessible to all authenticated users including viewers)
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        
        $jobs = Job::with(['customer', 'items', 'trackingDetails'])
            ->latest()
            ->paginate($perPage);

        return response()->json($jobs);
    }
}
