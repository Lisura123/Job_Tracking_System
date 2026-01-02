<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Job;
use App\Models\Item;
use App\Models\TrackingDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    /**
     * Display a listing of jobs
     */
    public function index(Request $request)
    {
        $query = Job::with(['customer', 'items', 'trackingDetails'])->latest();

        // Advanced filters
        $shippingMethod = $request->input('shipping_method');
        $companyName = $request->input('company_name');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $confirmationStatus = $request->input('confirmation_status');
        $sgStatus = $request->input('sg_status');
        
        // Shipping information filters
        $originalCaseNumber = $request->input('original_case_number');
        $clkCaseNumber = $request->input('clk_case_number');
        $trackingNumber = $request->input('tracking_number');
        
        // Date range filters for different date fields
        $lkShippedDateFrom = $request->input('lk_shipped_date_from');
        $lkShippedDateTo = $request->input('lk_shipped_date_to');
        $companyReceivedDateFrom = $request->input('company_received_date_from');
        $companyReceivedDateTo = $request->input('company_received_date_to');
        $supplierShippingDateFrom = $request->input('supplier_shipping_date_from');
        $supplierShippingDateTo = $request->input('supplier_shipping_date_to');
        $warehouseReceivedDateFrom = $request->input('warehouse_received_date_from');
        $warehouseReceivedDateTo = $request->input('warehouse_received_date_to');
        $shippedFromSgDateFrom = $request->input('shipped_from_sg_date_from');
        $shippedFromSgDateTo = $request->input('shipped_from_sg_date_to');
        $finalReceivedDateFrom = $request->input('final_received_date_from');
        $finalReceivedDateTo = $request->input('final_received_date_to');

        if ($shippingMethod && $shippingMethod !== '') {
            $query->where('shipping_method', $shippingMethod);
        }

        if ($companyName && $companyName !== '') {
            $query->where('company_name', 'LIKE', "%{$companyName}%");
        }
        
        if ($originalCaseNumber && $originalCaseNumber !== '') {
            $query->where('original_case_number', 'LIKE', "%{$originalCaseNumber}%");
        }
        
        if ($clkCaseNumber && $clkCaseNumber !== '') {
            $query->where('clk_case_number', 'LIKE', "%{$clkCaseNumber}%");
        }
        
        if ($trackingNumber && $trackingNumber !== '') {
            $query->whereHas('trackingDetails', function($q) use ($trackingNumber) {
                $q->where('tracking_number', 'LIKE', "%{$trackingNumber}%");
            });
        }

        // Legacy date filters (for backward compatibility)
        if ($dateFrom && $dateFrom !== '') {
            $query->where('lk_shipped_date', '>=', $dateFrom);
        }

        if ($dateTo && $dateTo !== '') {
            $query->where('lk_shipped_date', '<=', $dateTo);
        }
        
        // CameraLK Shipped Date filters
        if ($lkShippedDateFrom && $lkShippedDateFrom !== '') {
            $query->where('lk_shipped_date', '>=', $lkShippedDateFrom);
        }
        
        if ($lkShippedDateTo && $lkShippedDateTo !== '') {
            $query->where('lk_shipped_date', '<=', $lkShippedDateTo);
        }
        
        // Company Received Date filters
        if ($companyReceivedDateFrom && $companyReceivedDateFrom !== '') {
            $query->where('company_received_date', '>=', $companyReceivedDateFrom);
        }
        
        if ($companyReceivedDateTo && $companyReceivedDateTo !== '') {
            $query->where('company_received_date', '<=', $companyReceivedDateTo);
        }
        
        // Supplier Shipping Date filters
        if ($supplierShippingDateFrom && $supplierShippingDateFrom !== '') {
            $query->where('supplier_shipping_date', '>=', $supplierShippingDateFrom);
        }
        
        if ($supplierShippingDateTo && $supplierShippingDateTo !== '') {
            $query->where('supplier_shipping_date', '<=', $supplierShippingDateTo);
        }
        
        // Warehouse Received Date filters
        if ($warehouseReceivedDateFrom && $warehouseReceivedDateFrom !== '') {
            $query->where('warehouse_received_date', '>=', $warehouseReceivedDateFrom);
        }
        
        if ($warehouseReceivedDateTo && $warehouseReceivedDateTo !== '') {
            $query->where('warehouse_received_date', '<=', $warehouseReceivedDateTo);
        }
        
        // Shipped from Singapore Date filters
        if ($shippedFromSgDateFrom && $shippedFromSgDateFrom !== '') {
            $query->where('shipped_from_singapore_date', '>=', $shippedFromSgDateFrom);
        }
        
        if ($shippedFromSgDateTo && $shippedFromSgDateTo !== '') {
            $query->where('shipped_from_singapore_date', '<=', $shippedFromSgDateTo);
        }
        
        // Final Received Date filters
        if ($finalReceivedDateFrom && $finalReceivedDateFrom !== '') {
            $query->where('final_received_date', '>=', $finalReceivedDateFrom);
        }
        
        if ($finalReceivedDateTo && $finalReceivedDateTo !== '') {
            $query->where('final_received_date', '<=', $finalReceivedDateTo);
        }

        if ($confirmationStatus && $confirmationStatus !== '') {
            if ($confirmationStatus === 'confirmed') {
                $query->where('received_confirmation', true);
            } elseif ($confirmationStatus === 'pending') {
                $query->where('received_confirmation', false);
            }
        }

        if ($sgStatus && $sgStatus !== '') {
            if ($sgStatus === 'confirmed') {
                $query->where('sg', true);
            } elseif ($sgStatus === 'not_confirmed') {
                $query->where('sg', false);
            }
        }

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $status = $request->status;
            
            // Apply filters based on status - must match exact priority in Job model
            switch ($status) {
                case 'Job Completed':
                    // Priority 8: Has final_received_date
                    $query->whereNotNull('final_received_date');
                    break;
                    
                case 'Shipping Arranged from Singapore':
                    // Priority 7: Has shipped_from_singapore_date but no final_received_date
                    $query->whereNotNull('shipped_from_singapore_date')
                          ->whereNull('final_received_date');
                    break;
                    
                case 'Received by CameraLK Representative':
                    // Priority 6: Has clk_received_date but no shipped_from_singapore_date and no final_received_date
                    $query->whereNotNull('clk_received_date')
                          ->whereNull('shipped_from_singapore_date')
                          ->whereNull('final_received_date');
                    break;
                    
                case 'Received to Singapore':
                    // Priority 5: Has warehouse_received_date but no clk_received_date, shipped_from_singapore_date, and no final_received_date
                    $query->whereNotNull('warehouse_received_date')
                          ->whereNull('clk_received_date')
                          ->whereNull('shipped_from_singapore_date')
                          ->whereNull('final_received_date');
                    break;
                    
                case 'Supplier Shipped':
                    // Priority 4: Has supplier_shipping_date but no warehouse_received_date, clk_received_date, shipped_from_singapore_date, and no final_received_date
                    $query->whereNotNull('supplier_shipping_date')
                          ->whereNull('warehouse_received_date')
                          ->whereNull('clk_received_date')
                          ->whereNull('shipped_from_singapore_date')
                          ->whereNull('final_received_date');
                    break;
                    
                case 'Received to Company':
                    // Priority 3: Has company_received_date but no supplier_shipping_date, warehouse_received_date, clk_received_date, shipped_from_singapore_date, and no final_received_date
                    $query->whereNotNull('company_received_date')
                          ->whereNull('supplier_shipping_date')
                          ->whereNull('warehouse_received_date')
                          ->whereNull('clk_received_date')
                          ->whereNull('shipped_from_singapore_date')
                          ->whereNull('final_received_date');
                    break;
                    
                case 'Shipped from CameraLK':
                    // Priority 2: Has lk_shipped_date but no company_received_date, supplier_shipping_date, warehouse_received_date, clk_received_date, shipped_from_singapore_date, and no final_received_date
                    $query->whereNotNull('lk_shipped_date')
                          ->whereNull('company_received_date')
                          ->whereNull('supplier_shipping_date')
                          ->whereNull('warehouse_received_date')
                          ->whereNull('clk_received_date')
                          ->whereNull('shipped_from_singapore_date')
                          ->whereNull('final_received_date');
                    break;
                    
                case 'Ongoing Job':
                    // Priority 1: No dates set at all
                    $query->whereNull('lk_shipped_date')
                          ->whereNull('company_received_date')
                          ->whereNull('supplier_shipping_date')
                          ->whereNull('warehouse_received_date')
                          ->whereNull('clk_received_date')
                          ->whereNull('shipped_from_singapore_date')
                          ->whereNull('final_received_date');
                    break;
            }
        }

        $jobs = $query->paginate(15);

        return response()->json($jobs);
    }

    /**
     * Store a newly created job
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_number' => 'required|string|unique:jobs',
            'customer_id' => 'required|exists:customers,id',
            'company_name' => 'required|string',
            'original_case_number' => 'nullable|string',
            'clk_case_number' => 'nullable|string',
            'lk_shipped_date' => 'nullable|date',
            'lk_shipping_method' => 'nullable|string',
            'supplier_shipping_method' => 'nullable|string',
            'company_received_date' => 'nullable|date',
            'supplier_shipping_date' => 'nullable|date',
            'warehouse_received_date' => 'nullable|date',
            'received_confirmation_by' => 'nullable|string',
            'sg' => 'boolean',
            'shipped_from_singapore_date' => 'nullable|date',
            'final_received_date' => 'nullable|date',
            'received_by_person_name' => 'nullable|string',
            'received_confirmation' => 'boolean',
            'service_confirmation' => 'boolean',
            'items' => 'nullable|array',
            'items.*.name' => 'required|string',
            'items.*.serial_number' => 'nullable|string',
            'tracking' => 'nullable|array',
            'tracking.shipping_agent_name' => 'nullable|string',
            'tracking.tracking_number' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Create job
            $job = Job::create($validated);

            // Create items if provided
            if (isset($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    $job->items()->create($itemData);
                }
            }

            // Create tracking details if provided
            if (isset($validated['tracking'])) {
                $job->trackingDetails()->create($validated['tracking']);
            }

            DB::commit();

            return response()->json(
                Job::with(['customer', 'items', 'trackingDetails'])->find($job->id),
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create job'], 500);
        }
    }

    /**
     * Display the specified job
     */
    public function show($id)
    {
        $job = Job::with(['customer', 'items', 'trackingDetails'])->findOrFail($id);
        return response()->json($job);
    }

    /**
     * Update the specified job
     */
    public function update(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        $validated = $request->validate([
            'job_number' => 'sometimes|string|unique:jobs,job_number,' . $id,
            'customer_id' => 'sometimes|exists:customers,id',
            'company_name' => 'required|string',
            'original_case_number' => 'nullable|string',
            'clk_case_number' => 'nullable|string',
            'lk_shipped_date' => 'nullable|date',
            'lk_shipping_method' => 'nullable|string',
            'supplier_shipping_method' => 'nullable|string',
            'company_received_date' => 'nullable|date',
            'supplier_shipping_date' => 'nullable|date',
            'warehouse_received_date' => 'nullable|date',
            'received_confirmation_by' => 'nullable|string',
            'sg' => 'boolean',
            'shipped_from_singapore_date' => 'nullable|date',
            'final_received_date' => 'nullable|date',
            'received_by_person_name' => 'nullable|string',
            'received_confirmation' => 'boolean',
            'service_confirmation' => 'boolean',
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|exists:items,id',
            'items.*.name' => 'required|string',
            'items.*.serial_number' => 'nullable|string',
            'tracking' => 'nullable|array',
            'tracking.shipping_agent_name' => 'nullable|string',
            'tracking.tracking_number' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update job
            $job->update($validated);

            // Update items if provided
            if (isset($validated['items'])) {
                // Delete existing items not in the update
                $itemIds = collect($validated['items'])->pluck('id')->filter();
                $job->items()->whereNotIn('id', $itemIds)->delete();

                // Create or update items
                foreach ($validated['items'] as $itemData) {
                    if (isset($itemData['id'])) {
                        $item = Item::find($itemData['id']);
                        $item->update($itemData);
                    } else {
                        $job->items()->create($itemData);
                    }
                }
            }

            // Update tracking details if provided
            if (isset($validated['tracking'])) {
                if ($job->trackingDetails) {
                    $job->trackingDetails->update($validated['tracking']);
                } else {
                    $job->trackingDetails()->create($validated['tracking']);
                }
            }

            DB::commit();

            return response()->json(
                Job::with(['customer', 'items', 'trackingDetails'])->find($job->id)
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update job'], 500);
        }
    }

    /**
     * Remove the specified job
     */
    public function destroy($id)
    {
        $job = Job::findOrFail($id);
        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }
}
