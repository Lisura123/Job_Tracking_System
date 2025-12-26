import React, { useState, useEffect } from 'react';
import { jobService, customerService, Job, JobFormData, Customer } from '../../services/jobService';
import { toast } from 'react-toastify';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';

interface JobFormProps {
  job: Job | null;
  onClose: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ job, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [shippingAgents, setShippingAgents] = useState<string[]>([]);
  const [shippingMethods, setShippingMethods] = useState<string[]>([]);
  const [trackingNumbers, setTrackingNumbers] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    customer_number: '',
    name: '',
    contact_number: '',
  });
  const [formData, setFormData] = useState<JobFormData>({
    job_number: '',
    customer_id: 0,
    company_name: '',
    original_case_number: '',
    clk_case_number: '',
    lk_shipped_date: '',
    shipping_method: undefined,
    company_received_date: '',
    supplier_shipping_date: '',
    warehouse_received_date: '',
    received_confirmation_by: '',
    sg: false,
    shipped_from_singapore_date: '',
    final_received_date: '',
    received_by_person_name: '',
    received_confirmation: false,
    service_confirmation: false,
    items: [{ name: '', serial_number: '' }],
    tracking: { shipping_agent_name: '', tracking_number: '' },
  });

  // Fetch unique shipping agents and tracking numbers
  useEffect(() => {
    const fetchAutocompleteData = async () => {
      try {
        const [jobsResponse, customersResponse] = await Promise.all([
          jobService.getAllJobs(1),
          customerService.getAllCustomers(1)
        ]);
        
        const jobs = jobsResponse.data;
        
        // Extract unique shipping agent names
        const agents = [...new Set(
          jobs
            .map(j => j.tracking_details?.shipping_agent_name)
            .filter(name => name && name.trim() !== '')
        )] as string[];
        
        // Extract unique shipping methods
        const methods = [...new Set(
          jobs
            .map(j => j.shipping_method)
            .filter(method => method && method.trim() !== '')
        )] as string[];
        
        // Extract unique tracking numbers
        const numbers = [...new Set(
          jobs
            .map(j => j.tracking_details?.tracking_number)
            .filter(num => num && num.trim() !== '')
        )] as string[];
        
        setShippingAgents(agents);
        setShippingMethods(methods);
        setTrackingNumbers(numbers);
        setCustomers(customersResponse.data);
      } catch (error) {
        console.error('Failed to fetch autocomplete data:', error);
      }
    };
    
    fetchAutocompleteData();
  }, []);

  useEffect(() => {
    if (job) {
      // Helper function to convert ISO date to yyyy-MM-dd format
      const formatDateForInput = (dateString?: string) => {
        if (!dateString) return '';
        return dateString.split('T')[0]; // Extract just the date part
      };

      setFormData({
        job_number: job.job_number,
        customer_id: job.customer_id,
        company_name: job.company_name || '',
        original_case_number: job.original_case_number || '',
        clk_case_number: job.clk_case_number || '',
        lk_shipped_date: formatDateForInput(job.lk_shipped_date),
        shipping_method: job.shipping_method,
        company_received_date: formatDateForInput(job.company_received_date),
        supplier_shipping_date: formatDateForInput(job.supplier_shipping_date),
        warehouse_received_date: formatDateForInput(job.warehouse_received_date),
        received_confirmation_by: job.received_confirmation_by || '',
        sg: job.sg || false,
        shipped_from_singapore_date: formatDateForInput(job.shipped_from_singapore_date),
        final_received_date: formatDateForInput(job.final_received_date),
        received_by_person_name: job.received_by_person_name || '',
        received_confirmation: job.received_confirmation,
        service_confirmation: job.service_confirmation || false,
        items: job.items.length > 0 ? job.items : [{ name: '', serial_number: '' }],
        tracking: job.tracking_details || { shipping_agent_name: '', tracking_number: '' },
      });
      
      // Populate customer data for editing
      if (job.customer) {
        setNewCustomer({
          customer_number: job.customer.customer_number,
          name: job.customer.name,
          contact_number: job.customer.contact_number,
        });
      }
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let customerId: number;

      if (job) {
        // When updating, use existing customer ID and update customer info
        customerId = job.customer_id;
        
        // Update customer information
        await customerService.updateCustomer(customerId, {
          name: newCustomer.name,
          contact_number: newCustomer.contact_number,
        });
        
        // Update job with the existing customer ID
        const jobData = { ...formData, customer_id: customerId };
        await jobService.updateJob(job.id, jobData);
        toast.success('Job updated successfully');
      } else {
        // When creating new job, create customer first
        const customerNumber = newCustomer.customer_number || 
          `CUST-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const customerResponse = await customerService.createCustomer({
          ...newCustomer,
          customer_number: customerNumber
        });
        customerId = customerResponse.id;
        toast.success('Customer created successfully');

        // Create job with the new customer ID
        const jobData = { ...formData, customer_id: customerId };
        await jobService.createJob(jobData);
        toast.success('Job created successfully');
      }
      
      onClose();
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((err: any) => {
          toast.error(err[0]);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to save job');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleContactNumberChange = (contactNumber: string) => {
    setNewCustomer({ ...newCustomer, contact_number: contactNumber });
    
    // Auto-fill name if contact number exists
    const existingCustomer = customers.find(c => c.contact_number === contactNumber);
    if (existingCustomer) {
      setNewCustomer({ ...newCustomer, contact_number: contactNumber, name: existingCustomer.name });
    }
  };

  const handleItemChange = (index: number, field: 'name' | 'serial_number', value: string) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), { name: '', serial_number: '' }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl sm:rounded-t-lg">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button 
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Job Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Job Information
            </h3>
            <div className="space-y-4">
              {/* Job Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Number *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                  value={formData.job_number}
                  onChange={(e) => handleInputChange('job_number', e.target.value)}
                  placeholder="Enter job number"
                />
              </div>

              {/* Customer Contact Number & Name */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Contact Number *
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Customer Name *
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    list="contact-numbers"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                    value={newCustomer.contact_number}
                    onChange={(e) => handleContactNumberChange(e.target.value)}
                    placeholder="Contact Number"
                  />
                  <datalist id="contact-numbers">
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.contact_number}>
                        {customer.name}
                      </option>
                    ))}
                  </datalist>
                  <input
                    type="text"
                    required
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Customer Name"
                  />
                </div>
              </div>

              {/* Items with Serial Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Items with Serial Number *
                </label>
                <div className="space-y-3">
                  {formData.items?.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                      <input
                        type="text"
                        placeholder="Item Name *"
                        required
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Serial Number"
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={item.serial_number || ''}
                        onChange={(e) => handleItemChange(index, 'serial_number', e.target.value)}
                      />
                      {formData.items!.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-3 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all transform hover:scale-110"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-3 px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              {/* Original Case Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Original Case Number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                  value={formData.original_case_number}
                  onChange={(e) => handleInputChange('original_case_number', e.target.value)}
                  placeholder="Enter original case number"
                />
              </div>

              {/* CLK Case Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CLK Case Number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
                  value={formData.clk_case_number}
                  onChange={(e) => handleInputChange('clk_case_number', e.target.value)}
                  placeholder="Enter CLK case number"
                />
              </div>
            </div>
          </div>

          {/* Company */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Company
            </h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-400"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Shipping Information
            </h3>
            <div className="space-y-5">
              {/* CameraLK Shipped Date | Shipping Method | Remark */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    CameraLK Shipped Date
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Shipping Method
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Remark
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="date"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.lk_shipped_date}
                    onChange={(e) => handleInputChange('lk_shipped_date', e.target.value)}
                  />
                  <input
                    type="text"
                    list="shipping-methods"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-400"
                    value={formData.shipping_method || ''}
                    onChange={(e) => handleInputChange('shipping_method', e.target.value || undefined)}
                    placeholder="Enter shipping method"
                  />
                  <datalist id="shipping-methods">
                    {shippingMethods.map((method, idx) => (
                      <option key={idx} value={method} />
                    ))}
                  </datalist>
                  <input
                    type="text"
                    list="shipping-agents"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-400"
                    value={formData.tracking?.shipping_agent_name || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tracking: { ...formData.tracking, shipping_agent_name: e.target.value },
                      })
                    }
                    placeholder="Enter remark"
                  />
                  <datalist id="shipping-agents">
                    {shippingAgents.map((agent, idx) => (
                      <option key={idx} value={agent} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Company Received Date | Remark */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Company Received Date
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Remark
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.company_received_date}
                    onChange={(e) => handleInputChange('company_received_date', e.target.value)}
                  />
                  <input
                    type="text"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.received_confirmation_by || ''}
                    onChange={(e) => handleInputChange('received_confirmation_by', e.target.value)}
                    placeholder="Enter remark"
                  />
                </div>
              </div>

              {/* Supplier Shipping Date | Shipping Method | Tracking Number */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Supplier Shipping Date
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Shipping Method
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Tracking Number
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="date"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.supplier_shipping_date}
                    onChange={(e) => handleInputChange('supplier_shipping_date', e.target.value)}
                  />
                  <input
                    type="text"
                    list="shipping-methods"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-400"
                    value={formData.shipping_method || ''}
                    onChange={(e) => handleInputChange('shipping_method', e.target.value || undefined)}
                    placeholder="Enter shipping method"
                  />
                  <input
                    type="text"
                    list="tracking-numbers"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-400"
                    value={formData.tracking?.tracking_number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tracking: { ...formData.tracking, tracking_number: e.target.value },
                      })
                    }
                    placeholder="Enter tracking number"
                  />
                  <datalist id="tracking-numbers">
                    {trackingNumbers.map((number, idx) => (
                      <option key={idx} value={number} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Warehouse Received Date (Singapore) | Received Confirmation By SG Tick | Received by Name */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Warehouse Received Date (Singapore)
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Received Confirmation By SG
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Received by Name
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="date"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.warehouse_received_date}
                    onChange={(e) => handleInputChange('warehouse_received_date', e.target.value)}
                  />
                  <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all">
                    <input
                      type="checkbox"
                      id="sg"
                      className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      checked={formData.sg}
                      onChange={(e) => handleInputChange('sg', e.target.checked)}
                    />
                    <label htmlFor="sg" className="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer select-none">
                      SG Confirmation
                    </label>
                  </div>
                  <input
                    type="text"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.received_by_person_name}
                    onChange={(e) => handleInputChange('received_by_person_name', e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
              </div>

              {/* Received Confirmation by CameraLK Representative Date | Received by Name | Tick */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Received Confirmation by CameraLK Representative Date
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Received by Name
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Confirmation Status
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="date"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.received_confirmation_by}
                    onChange={(e) => handleInputChange('received_confirmation_by', e.target.value)}
                  />
                  <input
                    type="text"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.received_by_person_name}
                    onChange={(e) => handleInputChange('received_by_person_name', e.target.value)}
                    placeholder="Enter name"
                  />
                  <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-lg bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all">
                    <input
                      type="checkbox"
                      id="received_confirmation"
                      className="h-5 w-5 text-green-600 focus:ring-2 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      checked={formData.received_confirmation}
                      onChange={(e) => handleInputChange('received_confirmation', e.target.checked)}
                    />
                    <label htmlFor="received_confirmation" className="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer select-none">
                      Confirmed
                    </label>
                  </div>
                </div>
              </div>

              {/* Shipping Arranged from Singapore Date */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Shipping Arranged from Singapore Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={formData.shipped_from_singapore_date}
                  onChange={(e) => handleInputChange('shipped_from_singapore_date', e.target.value)}
                />
              </div>

              {/* Service CameraLK Received Date | Tick | By Person Name */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Service CameraLK Received Date
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    Confirmation Status
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    By Person Name
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="date"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.final_received_date}
                    onChange={(e) => handleInputChange('final_received_date', e.target.value)}
                  />
                  <div className="flex items-center px-4 py-3 border-2 border-gray-300 rounded-lg bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 transition-all">
                    <input
                      type="checkbox"
                      id="service_confirmation"
                      className="h-5 w-5 text-teal-600 focus:ring-2 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                      checked={formData.service_confirmation}
                      onChange={(e) => handleInputChange('service_confirmation', e.target.checked)}
                    />
                    <label htmlFor="service_confirmation" className="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer select-none">
                      Confirmed
                    </label>
                  </div>
                  <input
                    type="text"
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={formData.received_by_person_name}
                    onChange={(e) => handleInputChange('received_by_person_name', e.target.value)}
                    placeholder="Enter person name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-300 sticky bottom-0 bg-white pb-4 sm:pb-0 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] w-full sm:w-auto px-8 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 order-2 sm:order-1 transition-all transform hover:scale-105 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[48px] w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 font-semibold shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {job ? '✓ Update Job' : '+ Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
