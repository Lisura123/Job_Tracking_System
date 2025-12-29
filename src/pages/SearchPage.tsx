import React, { useState, useEffect, useRef } from 'react';
import { jobService, Job, AdvancedFilters } from '../services/jobService';
import { toast } from 'react-toastify';
import { Search, Loader2, Package, User, Phone, Calendar, CheckCircle, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

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
      case 'Job Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Shipping Arranged from Singapore':
      case 'Shipped from SG':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Received by CameraLK Representative':
      case 'Received by CLK Rep':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Received to Singapore':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Supplier Shipped':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
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
      } catch (error: any) {
        console.error('Failed to load recent jobs:', error);
        toast.error(error.response?.data?.message || 'Failed to load recent jobs. Please try again.');
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
    } catch (error: any) {
      console.error('Failed to reset page:', error);
      toast.error(error.response?.data?.message || 'Failed to reset page. Please try again.');
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
      // Build advanced filters object with only populated values
      const advancedFilters: AdvancedFilters = {};

      const trimmedTrackingNumber = trackingNumber.trim();
      const trimmedCompanyName = companyName.trim();
      const trimmedOriginalCaseNumber = originalCaseNumber.trim();
      const trimmedClkCaseNumber = clkCaseNumber.trim();

      if (trimmedTrackingNumber) {
        advancedFilters.tracking_number = trimmedTrackingNumber;
      }
      if (trimmedCompanyName) {
        advancedFilters.company_name = trimmedCompanyName;
      }
      if (trimmedOriginalCaseNumber) {
        advancedFilters.original_case_number = trimmedOriginalCaseNumber;
      }
      if (trimmedClkCaseNumber) {
        advancedFilters.clk_case_number = trimmedClkCaseNumber;
      }

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

      // Only pass advancedFilters if there are actual filter values (not just status)
      const hasAdvancedFilters = Object.keys(advancedFilters).length > 0;
      
      console.log('Applying filters:', { status: statusFilter, advancedFilters, hasAdvancedFilters });
      
      const response = await jobService.getAllJobs(
        page,
        statusFilter || undefined,
        hasAdvancedFilters ? advancedFilters : undefined
      );
      
      setJobs(response.data);
      setResultType('filter');
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
      
      if (response.data.length === 0) {
        toast.info('No jobs found matching your filters');
      } else {
        toast.success(`Found ${response.total} job(s)`);
      }
    } catch (error: any) {
      console.error('Filter error:', error);
      toast.error(error.response?.data?.message || 'Failed to apply filters');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-3 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Page Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">Job Tracking & Search</h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Search and track your jobs in real-time</p>
        </div>

        {/* Search Header - Fully Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-100 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg">
                <Search className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Job Tracking & Search</h1>
            </div>
            <button
              onClick={handleResetPage}
              disabled={loading}
              className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 hover:border-gray-300 transition-all shadow-sm flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reset Page</span>
              <span className="sm:hidden">Reset</span>
            </button>
          </div>
          
          {/* Search Section - Mobile First */}
          <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <span className="text-blue-600 text-sm sm:text-base">🔍</span>
              Search Jobs
            </h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="w-full relative group" ref={suggestionRef}>
                <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-blue-300 shadow-sm"
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
                className="w-full sm:w-auto min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm sm:text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:transform-none"
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
                      <option value="Supplier Shipped">4. Supplier Shipped</option>
                      <option value="Received to Singapore">5. Received to Singapore</option>
                      <option value="Received by CameraLK Representative">6. Received by CLK Rep</option>
                      <option value="Shipping Arranged from Singapore">7. Shipped from SG</option>
                      <option value="Job Completed">8. Job Completed</option>
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

        {/* Results Display - Fully Responsive */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md flex-shrink-0">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent truncate">
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
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0">
                  {pagination.total}
                </span>
              </div>
              {(resultType === 'search' || resultType === 'filter') && (
                <button
                  onClick={handleResetPage}
                  disabled={loading}
                  className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all shadow-sm flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>

            <div className="space-y-3 sm:space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handleViewDetails(job)}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header Row - Job Number & Icon */}
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-md flex-shrink-0">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">{job.job_number}</span>
                          {job.clk_case_number && (
                            <span className="text-xs px-2 sm:px-2.5 py-0.5 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 rounded-full font-semibold border border-indigo-300">
                              {job.clk_case_number}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                          <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">{job.customer.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge - Full Width on Mobile */}
                    <div className="flex items-center">
                      <span className={`w-full sm:w-auto text-center px-3 py-1.5 sm:py-2 text-xs sm:text-xs font-bold rounded-lg border-2 shadow-sm ${getStatusColor(job.status)}`}>
                        {job.status === 'Shipping Arranged from Singapore' ? 'Shipped from SG' : 
                         job.status === 'Received by CameraLK Representative' ? 'Received by CLK Rep' : 
                         job.status}
                      </span>
                    </div>
                    
                    {/* View Details Link */}
                    <div className="flex items-center justify-center sm:justify-end pt-2 sm:pt-2 border-t border-gray-100">
                      <span className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-all group-hover:gap-2">
                        View Full Details
                        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Touch-friendly & Fully Responsive */}
            {pagination.lastPage > 1 && (
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="min-h-[44px] w-full sm:w-auto px-4 sm:px-6 py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                >
                  ← Previous
                </button>
                <span className="min-h-[44px] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg border-2 border-blue-200 flex items-center justify-center">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="min-h-[44px] w-full sm:w-auto px-4 sm:px-6 py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
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
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border-2 border-blue-200 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 font-medium">Current Status</p>
                      <span className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg border-2 shadow-sm inline-block ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status === 'Shipping Arranged from Singapore' ? 'Shipped from SG' : 
                         selectedJob.status === 'Received by CameraLK Representative' ? 'Received by CLK Rep' : 
                         selectedJob.status}
                      </span>
                    </div>
                    <Package className="h-12 w-12 text-blue-400 opacity-50" />
                  </div>
                </div>

                {/* Job Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Job Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Job Number</p>
                      <p className="font-medium text-sm sm:text-base bg-white px-3 py-2 rounded-lg">{selectedJob.job_number}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Contact Number</p>
                        <p className="font-medium text-sm sm:text-base bg-white px-3 py-2 rounded-lg">{selectedJob.customer.contact_number}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Customer Name</p>
                        <p className="font-medium text-sm sm:text-base bg-white px-3 py-2 rounded-lg">{selectedJob.customer.name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Items with Serial Number</p>
                      {selectedJob.items && selectedJob.items.length > 0 ? (
                        <div className="space-y-2">
                          {selectedJob.items.map((item, index) => (
                            <div key={item.id || index} className="bg-white p-3 rounded-lg border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-gray-600">Item Name</p>
                                  <p className="font-medium text-sm">{item.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Serial Number</p>
                                  <p className="font-medium text-sm">{item.serial_number || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm bg-white px-3 py-2 rounded-lg">No items listed</p>
                      )}
                    </div>
                    {selectedJob.original_case_number && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Original Case Number</p>
                        <p className="font-medium text-sm sm:text-base bg-white px-3 py-2 rounded-lg">{selectedJob.original_case_number}</p>
                      </div>
                    )}
                    {selectedJob.clk_case_number && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">CLK Case Number</p>
                        <p className="font-medium text-sm sm:text-base bg-white px-3 py-2 rounded-lg">{selectedJob.clk_case_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company */}
                {selectedJob.company_name && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                      Company
                    </h3>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Company Name</p>
                      <p className="font-medium text-sm sm:text-base bg-white px-3 py-2 rounded-lg">{selectedJob.company_name}</p>
                    </div>
                  </div>
                )}

                {/* Shipping Information */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 sm:p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Shipping Information
                  </h3>
                  <div className="space-y-4">
                {/* Shipping Timeline - Collapsible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
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
                        { label: 'Received by CameraLK Representative', date: selectedJob.clk_received_date, person: selectedJob.clk_received_by_name },
                        { label: 'Shipping Arranged from Singapore Date', date: selectedJob.shipped_from_singapore_date },
                        { label: 'Service CameraLK Received Date', date: selectedJob.final_received_date, person: selectedJob.final_received_by_name },
                      ].filter(item => item.date).map((item, index) => (
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
                      {![
                        selectedJob.lk_shipped_date,
                        selectedJob.company_received_date,
                        selectedJob.supplier_shipping_date,
                        selectedJob.warehouse_received_date,
                        selectedJob.clk_received_date,
                        selectedJob.shipped_from_singapore_date,
                        selectedJob.final_received_date,
                      ].some(date => date) && (
                        <p className="text-gray-500 text-sm">No shipping timeline details available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tracking Details - Collapsible */}
                {selectedJob.tracking_details?.tracking_number && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
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
                          <p className="font-medium text-sm sm:text-base break-all">{selectedJob.tracking_details.tracking_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirmation - Collapsible */}
                {(selectedJob.received_confirmation || selectedJob.sg || selectedJob.service_confirmation) && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
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
                          {selectedJob.received_confirmation && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-600">Company Received Confirmation</p>
                                  <span className="font-medium text-sm">Confirmed</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedJob.sg && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-600">SG</p>
                                  <span className="font-medium text-sm">Confirmed</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedJob.service_confirmation && (
                            <div className="bg-gray-50 p-3 rounded-lg sm:col-span-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-600">Service CameraLK Received Confirmation</p>
                                  <span className="font-medium text-sm">Confirmed</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                  </div>
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
