import React, { useState, useEffect, useRef } from 'react';
import { jobService, Job } from '../services/jobService';
import { toast } from 'react-toastify';
import { Search, Loader2, Package, User, Phone, Calendar, CheckCircle, XCircle, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [resultType, setResultType] = useState<'recent' | 'search' | 'filter'>('recent');
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<{
    job_numbers: string[];
    customer_names: string[];
    phone_numbers: string[];
    original_case_numbers: string[];
    clk_case_numbers: string[];
  }>({ job_numbers: [], customer_names: [], phone_numbers: [], original_case_numbers: [], clk_case_numbers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  // Shipping Information Filters
  const [trackingNumber, setTrackingNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [originalCaseNumber, setOriginalCaseNumber] = useState('');
  const [clkCaseNumber, setClkCaseNumber] = useState('');
  const [lkShippedDate, setLkShippedDate] = useState('');
  const [companyReceivedDate, setCompanyReceivedDate] = useState('');
  const [supplierShippingDate, setSupplierShippingDate] = useState('');
  const [warehouseReceivedDate, setWarehouseReceivedDate] = useState('');
  const [shippedFromSgDate, setShippedFromSgDate] = useState('');
  const [finalReceivedDate, setFinalReceivedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    customer: true,
    job: true,
    items: true,
    timeline: true,
    tracking: true,
    confirmation: true,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Service Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Shipped from Singapore':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Singapore Processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Received to Company':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Shipped from CameraLK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Ongoing Job':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length === 0) {
        setSuggestions({ job_numbers: [], customer_names: [], phone_numbers: [], original_case_numbers: [], clk_case_numbers: [] });
        setShowSuggestions(false);
        return;
      }

      try {
        const data = await jobService.getSuggestions(query.trim(), 10);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        // Silently fail for suggestions
        setSuggestions({ job_numbers: [], customer_names: [], phone_numbers: [], original_case_numbers: [], clk_case_numbers: [] });
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Load all recent jobs on page load
  useEffect(() => {
    const loadRecentJobs = async () => {
      setLoading(true);
      try {
        const response = await jobService.getAllJobs(1);
        setJobs(response.data);
        setResultType('recent');
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          total: response.data.length,
        });
      } catch (error) {
        console.error('Failed to load recent jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentJobs();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(1, suggestion);
  };

  const hasActiveFilters = () => {
    return trackingNumber || companyName || originalCaseNumber || clkCaseNumber || 
           lkShippedDate || companyReceivedDate || supplierShippingDate || warehouseReceivedDate ||
           shippedFromSgDate || finalReceivedDate || statusFilter;
  };

  const handleResetPage = async () => {
    setLoading(true);
    try {
      // Clear all filters
      setTrackingNumber('');
      setCompanyName('');
      setOriginalCaseNumber('');
      setClkCaseNumber('');
      setLkShippedDate('');
      setCompanyReceivedDate('');
      setSupplierShippingDate('');
      setWarehouseReceivedDate('');
      setShippedFromSgDate('');
      setFinalReceivedDate('');
      setStatusFilter('');
      setQuery('');
      
      // Load recent jobs
      const response = await jobService.getAllJobs(1);
      setJobs(response.data);
      setResultType('recent');
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.data.length,
      });
    } catch (error) {
      console.error('Failed to reset page:', error);
      toast.error('Failed to reset page');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setTrackingNumber('');
    setCompanyName('');
    setOriginalCaseNumber('');
    setClkCaseNumber('');
    setLkShippedDate('');
    setCompanyReceivedDate('');
    setSupplierShippingDate('');
    setWarehouseReceivedDate('');
    setShippedFromSgDate('');
    setFinalReceivedDate('');
    setStatusFilter('');
    setJobs([]);
    setPagination({ currentPage: 1, lastPage: 1, total: 0 });
  };

  const handleApplyFilters = async (page: number = 1) => {
    if (!hasActiveFilters()) {
      toast.error('Please select at least one filter');
      return;
    }

    setLoading(true);
    try {
      // Build advanced filters object
      const advancedFilters: any = {
        tracking_number: trackingNumber,
        company_name: companyName,
        original_case_number: originalCaseNumber,
        clk_case_number: clkCaseNumber,
        status: statusFilter
      };

      // Add date filters as both from and to for exact match
      if (lkShippedDate) {
        advancedFilters.lk_shipped_date_from = lkShippedDate;
        advancedFilters.lk_shipped_date_to = lkShippedDate;
      }
      if (companyReceivedDate) {
        advancedFilters.company_received_date_from = companyReceivedDate;
        advancedFilters.company_received_date_to = companyReceivedDate;
      }
      if (supplierShippingDate) {
        advancedFilters.supplier_shipping_date_from = supplierShippingDate;
        advancedFilters.supplier_shipping_date_to = supplierShippingDate;
      }
      if (warehouseReceivedDate) {
        advancedFilters.warehouse_received_date_from = warehouseReceivedDate;
        advancedFilters.warehouse_received_date_to = warehouseReceivedDate;
      }
      if (shippedFromSgDate) {
        advancedFilters.shipped_from_sg_date_from = shippedFromSgDate;
        advancedFilters.shipped_from_sg_date_to = shippedFromSgDate;
      }
      if (finalReceivedDate) {
        advancedFilters.final_received_date_from = finalReceivedDate;
        advancedFilters.final_received_date_to = finalReceivedDate;
      }

      const response = await jobService.getAllJobs(page, undefined, advancedFilters);
      
      setJobs(response.data);
      setResultType('filter');
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.data.length,
      });
      
      if (response.data.length === 0) {
        toast.info('No jobs found matching your filters');
      } else {
        toast.success(`Found ${response.data.length} job(s)`);
      }
    } catch (error: any) {
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page: number = 1, searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const response = await jobService.search(searchTerm, page);
      setJobs(response.data);
      setResultType('search');
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
      if (response.data.length === 0) {
        toast.info('No jobs found matching your search');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = async (page: number) => {
    if (resultType === 'search') {
      await handleSearch(page);
    } else if (resultType === 'filter') {
      await handleApplyFilters(page);
    } else {
      // Recent jobs pagination
      setLoading(true);
      try {
        const response = await jobService.getAllJobs(page);
        setJobs(response.data);
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          total: response.data.length,
        });
      } catch (error) {
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header - Responsive */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Job Tracking & Search</h1>
            </div>
            <button
              onClick={handleResetPage}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Reset Page</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </div>
          
          {/* Search Section */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-blue-600">🔍</span>
              Search Jobs
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative group" ref={suggestionRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 sm:py-3 border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-sm transition-all hover:border-blue-300 shadow-sm"
                  placeholder="Search by Job Number, Customer Name, or Phone Number..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => query.trim() && setShowSuggestions(true)}
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && (suggestions.job_numbers.length > 0 || suggestions.customer_names.length > 0 || suggestions.phone_numbers.length > 0 || suggestions.original_case_numbers.length > 0 || suggestions.clk_case_numbers.length > 0) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {/* Job Numbers */}
                    {suggestions.job_numbers.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          Job Numbers
                        </div>
                        {suggestions.job_numbers.map((jobNumber, index) => (
                          <button
                            key={`job-${index}`}
                            onClick={() => handleSuggestionClick(jobNumber)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Package className="h-4 w-4 text-blue-500" />
                            {jobNumber}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Original Case Numbers */}
                    {suggestions.original_case_numbers.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          Original Case Numbers
                        </div>
                        {suggestions.original_case_numbers.map((caseNumber, index) => (
                          <button
                            key={`original-${index}`}
                            onClick={() => handleSuggestionClick(caseNumber)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Package className="h-4 w-4 text-orange-500" />
                            {caseNumber}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* CLK Case Numbers */}
                    {suggestions.clk_case_numbers.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          CLK Case Numbers
                        </div>
                        {suggestions.clk_case_numbers.map((caseNumber, index) => (
                          <button
                            key={`clk-${index}`}
                            onClick={() => handleSuggestionClick(caseNumber)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Package className="h-4 w-4 text-indigo-500" />
                            {caseNumber}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Customer Names */}
                    {suggestions.customer_names.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          Customer Names
                        </div>
                        {suggestions.customer_names.map((name, index) => (
                          <button
                            key={`name-${index}`}
                            onClick={() => handleSuggestionClick(name)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                          >
                            <User className="h-4 w-4 text-green-500" />
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Phone Numbers */}
                    {suggestions.phone_numbers.length > 0 && (
                      <div>
                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          Phone Numbers
                        </div>
                        {suggestions.phone_numbers.map((phone, index) => (
                          <button
                            key={`phone-${index}`}
                            onClick={() => handleSuggestionClick(phone)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm text-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4 text-purple-500" />
                            {phone}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="min-h-[44px] px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Shipping Information Filters Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Filter className="h-5 w-5 text-green-600" />
                <span className="text-green-600">📦</span>
                Track by Shipping Information
                <span className="text-xs text-gray-500 ml-1">
                  ({hasActiveFilters() ? Object.values({trackingNumber, companyName, originalCaseNumber, clkCaseNumber, lkShippedDate, companyReceivedDate, supplierShippingDate, warehouseReceivedDate, shippedFromSgDate, finalReceivedDate}).filter(v => v !== '').length : 0} active)
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              {hasActiveFilters() && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Tracking Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number..."
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name..."
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Original Case Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Original Case Number</label>
                    <input
                      type="text"
                      value={originalCaseNumber}
                      onChange={(e) => setOriginalCaseNumber(e.target.value)}
                      placeholder="Enter original case number..."
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* CLK Case Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">CLK Case Number</label>
                    <input
                      type="text"
                      value={clkCaseNumber}
                      onChange={(e) => setClkCaseNumber(e.target.value)}
                      placeholder="Enter CLK case number..."
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* CameraLK Shipped Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">CameraLK Shipped Date</label>
                    <input
                      type="date"
                      value={lkShippedDate}
                      onChange={(e) => setLkShippedDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Company Received Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Received Date</label>
                    <input
                      type="date"
                      value={companyReceivedDate}
                      onChange={(e) => setCompanyReceivedDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Supplier Shipping Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Supplier Shipping Date</label>
                    <input
                      type="date"
                      value={supplierShippingDate}
                      onChange={(e) => setSupplierShippingDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Warehouse Received Date (Singapore) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Warehouse Received Date (Singapore)</label>
                    <input
                      type="date"
                      value={warehouseReceivedDate}
                      onChange={(e) => setWarehouseReceivedDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Shipping Arranged from Singapore Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Shipping Arranged from Singapore Date</label>
                    <input
                      type="date"
                      value={shippedFromSgDate}
                      onChange={(e) => setShippedFromSgDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Service CameraLK Received Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Service CameraLK Received Date</label>
                    <input
                      type="date"
                      value={finalReceivedDate}
                      onChange={(e) => setFinalReceivedDate(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-green-300 transition-all shadow-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="Ongoing Job">1. Ongoing Job</option>
                      <option value="Shipped from CameraLK">2. Shipped from CameraLK</option>
                      <option value="Received to Company">3. Received to Company</option>
                      <option value="Singapore Processing">4. Singapore Processing</option>
                      <option value="Shipped from Singapore">5. Shipped from Singapore</option>
                      <option value="Job Completed">6. Job Completed</option>
                    </select>
                  </div>
                </div>

                {/* Apply Filters Button */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => handleApplyFilters()}
                    disabled={loading || !hasActiveFilters()}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Filtering...
                      </>
                    ) : (
                      <>
                        <Filter className="h-4 w-4" />
                        Apply Filters
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Display - Card View on Mobile, List on Desktop */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">
                    {resultType === 'recent' && 'Recent Jobs'}
                    {resultType === 'search' && 'Search Results'}
                    {resultType === 'filter' && 'Filter Results'}
                  </span>
                  <span className="sm:hidden">
                    {resultType === 'recent' && 'Jobs'}
                    {resultType === 'search' && 'Results'}
                    {resultType === 'filter' && 'Filtered'}
                  </span>
                </h2>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold">
                  {pagination.total}
                </span>
              </div>
              {(resultType === 'search' || resultType === 'filter') && (
                <button
                  onClick={handleResetPage}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border-2 border-gray-100 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Job Number */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="font-bold text-gray-900">{job.job_number}</span>
                    </div>
                    
                    {/* Contact Number */}
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{job.customer.contact_number}</span>
                    </div>
                    
                    {/* Current Status */}
                    <div className="flex-grow">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 shadow-sm ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    {/* View Details Button */}
                    <button 
                      onClick={() => handleViewDetails(job)}
                      className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Touch-friendly */}
            {pagination.lastPage > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="min-h-[44px] w-full sm:w-auto px-6 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                >
                  ← Previous
                </button>
                <span className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg border-2 border-blue-200">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="min-h-[44px] w-full sm:w-auto px-6 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Job Details Modal - Full Screen on Mobile, Centered on Desktop */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-t-4 border-blue-500">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 flex justify-between items-center z-10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white truncate pr-2">
                    <span className="hidden sm:inline opacity-90">Job Details: </span>
                    {selectedJob.job_number}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Current Status - Prominent Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Current Status</p>
                      <span className={`inline-flex px-4 py-2 text-sm sm:text-base font-bold rounded-full border-2 ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <Package className="h-12 w-12 text-blue-400 opacity-50" />
                  </div>
                </div>

                {/* Customer Information - Collapsible on Mobile */}
                <div className="border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <button
                    onClick={() => toggleSection('customer')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Customer Information
                    </h3>
                    {expandedSections.customer ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.customer && (
                    <div className="p-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Contact Number</p>
                        <p className="font-medium text-sm sm:text-base">{selectedJob.customer.contact_number}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Customer Name</p>
                        <p className="font-medium text-sm sm:text-base">{selectedJob.customer.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Job Information - Collapsible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('job')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Job Information</h3>
                    {expandedSections.job ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.job && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Original Case Number</p>
                          <p className="font-medium text-sm sm:text-base">{selectedJob.original_case_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">CLK Case Number</p>
                          <p className="font-medium text-sm sm:text-base">{selectedJob.clk_case_number || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Company Name</p>
                        <p className="font-medium text-sm sm:text-base">{selectedJob.company_name || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items - Collapsible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('items')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Items</h3>
                    {expandedSections.items ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.items && (
                    <div className="p-4">
                      {selectedJob.items && selectedJob.items.length > 0 ? (
                        <div className="space-y-2">
                          {selectedJob.items.map((item, index) => (
                            <div key={item.id || index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 last:border-0 gap-1">
                              <span className="font-medium text-sm sm:text-base">{item.name}</span>
                              <span className="text-xs sm:text-sm text-gray-600">SN: {item.serial_number || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No items listed</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Shipping Timeline - Collapsible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('timeline')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Shipping Timeline</h3>
                    {expandedSections.timeline ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.timeline && (
                    <div className="p-4 space-y-3">
                      {[
                        { label: 'CameraLK Shipped Date', date: selectedJob.lk_shipped_date, method: selectedJob.lk_shipping_method, remark: selectedJob.tracking_details?.shipping_agent_name },
                        { label: 'Company Received Date', date: selectedJob.company_received_date, remark: selectedJob.received_confirmation_by },
                        { label: 'Supplier Shipping Date', date: selectedJob.supplier_shipping_date, method: selectedJob.supplier_shipping_method },
                        { label: 'Warehouse Received Date (Singapore)', date: selectedJob.warehouse_received_date, person: selectedJob.sg_received_by_name },
                        { label: 'Received by CameraLK Representative', date: selectedJob.received_confirmation_by, person: selectedJob.clk_received_by_name },
                        { label: 'Shipping Arranged from Singapore Date', date: selectedJob.shipped_from_singapore_date },
                        { label: 'Service CameraLK Received Date', date: selectedJob.final_received_date, person: selectedJob.final_received_by_name },
                      ].map((item, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-600 mb-0.5">{item.label}</p>
                              <p className="font-medium text-sm sm:text-base">{formatDate(item.date)}</p>
                              {item.remark && (
                                <p className="text-xs text-gray-500 mt-1">Remark: {item.remark}</p>
                              )}
                              {item.method && (
                                <p className="text-xs text-gray-500 mt-1">Method: {item.method}</p>
                              )}
                              {item.person && (
                                <p className="text-xs text-gray-500 mt-1">Received By: {item.person}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tracking Details - Collapsible */}
                {selectedJob.tracking_details && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('tracking')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tracking Details</h3>
                      {expandedSections.tracking ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.tracking && (
                      <div className="p-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Tracking Number</p>
                          <p className="font-medium text-sm sm:text-base break-all">{selectedJob.tracking_details.tracking_number || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirmation - Collapsible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('confirmation')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Confirmation</h3>
                    {expandedSections.confirmation ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.confirmation && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            {selectedJob.received_confirmation ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-xs text-gray-600">Company Received Confirmation</p>
                              <span className="font-medium text-sm">
                                {selectedJob.received_confirmation ? 'Confirmed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            {selectedJob.sg ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-xs text-gray-600">SG</p>
                              <span className="font-medium text-sm">
                                {selectedJob.sg ? 'Confirmed' : 'Not Confirmed'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg sm:col-span-2">
                          <div className="flex items-center gap-2">
                            {selectedJob.service_confirmation ? (
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-xs text-gray-600">Service CameraLK Received Confirmation</p>
                              <span className="font-medium text-sm">
                                {selectedJob.service_confirmation ? 'Confirmed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Footer - Touch-friendly close button */}
              <div className="sticky bottom-0 bg-gradient-to-r from-gray-100 to-blue-100 border-t-2 border-gray-200 px-4 sm:px-6 py-4 shadow-lg">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="min-h-[44px] w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
