<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $customers = Customer::latest()->paginate($perPage);
        return response()->json($customers);
    }

    /**
     * Store a newly created customer
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_number' => 'required|string|unique:customers',
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
        ]);

        $customer = Customer::create($validated);

        return response()->json($customer, 201);
    }

    /**
     * Display the specified customer
     */
    public function show($id)
    {
        $customer = Customer::with('jobs')->findOrFail($id);
        return response()->json($customer);
    }

    /**
     * Update the specified customer
     */
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'customer_number' => 'sometimes|string|unique:customers,customer_number,' . $id,
            'name' => 'sometimes|string|max:255',
            'contact_number' => 'sometimes|string|max:255',
        ]);

        $customer->update($validated);

        return response()->json($customer);
    }

    /**
     * Remove the specified customer
     */
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully']);
    }
}
