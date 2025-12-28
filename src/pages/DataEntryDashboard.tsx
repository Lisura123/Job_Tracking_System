import React, { useState, useEffect } from 'react';
import { jobService, Job } from '../services/jobService';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Package, Loader2, Search } from 'lucide-react';
import JobForm from '../components/admin/JobForm';

const DataEntryDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Job Completed':
        return 'bg-green-100 text-green-800';
      case 'Shipping Arranged from Singapore':
        return 'bg-blue-100 text-blue-800';
      case 'Received by CameraLK Representative':
        return 'bg-teal-100 text-teal-800';
      case 'Received to Singapore':
        return 'bg-purple-100 text-purple-800';
      case 'Supplier Shipped':
        return 'bg-cyan-100 text-cyan-800';
      case 'Received to Company':
        return 'bg-indigo-100 text-indigo-800';
      case 'Shipped from CameraLK':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ongoing Job':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await jobService.getAllJobs(page);
      setJobs(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
    } catch (error: any) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      loadJobs(page);
      return;
    }

    setLoading(true);
    try {
      const response = await jobService.search(searchQuery, page);
      setJobs(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
      if (response.data.length === 0) {
        toast.info('No jobs found matching your search');
      }
    } catch (error: any) {
      toast.error('Failed to search jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    loadJobs();
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobService.deleteJob(id);
      toast.success('Job deleted successfully');
      loadJobs(pagination.currentPage);
    } catch (error: any) {
      toast.error('Failed to delete job');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleJobFormClose = () => {
    setShowJobForm(false);
    setEditingJob(null);
    loadJobs(pagination.currentPage);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Data Entry Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Manage and track all job entries
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">All Jobs</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    {pagination.total} Total
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>Displaying page {pagination.currentPage} of {pagination.lastPage}</span>
                </p>
              </div>
              <button
                onClick={() => setShowJobForm(true)}
                className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Job
              </button>
            </div>

              {/* Search Section */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200/50 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Quick Search</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="🔍 Search by job number, customer name, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 border-2 border-white/80 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-sm transition-all hover:border-blue-300 bg-white shadow-sm placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading}
                      className="min-h-[44px] px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span className="hidden sm:inline">Search</span>
                    </button>
                    {searchQuery && (
                      <button
                        onClick={handleReset}
                        className="min-h-[44px] px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 text-sm font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all shadow-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <div className="relative">
                    <div className="h-20 w-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <Package className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-16 px-4">
                  <div className="bg-gradient-to-br from-gray-100 to-blue-100 rounded-full p-6 mb-4">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    {searchQuery 
                      ? `No results found for "${searchQuery}". Try adjusting your search.` 
                      : 'Get started by creating your first job entry.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowJobForm(true)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Job
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto rounded-xl border-2 border-gray-100 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job Number</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Shipping Method</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Final Received</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {jobs.map((job, index) => (
                          <tr key={job.id} className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                          }`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer">{job.job_number}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                                  {job.customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{job.customer.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600 font-medium">{job.lk_shipping_method || job.supplier_shipping_method || <span className="text-gray-400 italic">N/A</span>}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(job.final_received_date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm border-2 ${getStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditJob(job)}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 hover:text-blue-900 transition-all duration-200 font-semibold shadow-sm hover:shadow border border-blue-200 hover:border-blue-300"
                                  aria-label="Edit job"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-900 transition-all duration-200 font-semibold shadow-sm hover:shadow border border-red-200 hover:border-red-300"
                                  aria-label="Delete job"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet Card View */}
                  <div className="lg:hidden space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="bg-gradient-to-br from-white to-blue-50/20 border-2 border-gray-200 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:border-blue-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                                <Package className="h-4 w-4 text-white" />
                              </div>
                              <h3 className="text-base font-bold text-gray-900 truncate">{job.job_number}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-shrink-0 h-7 w-7 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                {job.customer.name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-sm text-gray-600 truncate font-medium">{job.customer.name}</p>
                            </div>
                          </div>
                          <span className={`ml-2 px-2.5 py-1.5 text-xs font-bold rounded-full flex-shrink-0 shadow-sm border-2 ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        
                        <div className="bg-white/60 rounded-lg p-3 mb-3 space-y-2 border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipping Method</span>
                            <span className="text-sm font-medium text-gray-900">{job.lk_shipping_method || job.supplier_shipping_method || <span className="text-gray-400 italic">N/A</span>}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Final Received</span>
                            <span className="text-sm font-medium text-gray-900">{formatDate(job.final_received_date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="min-h-[44px] flex-1 inline-flex items-center justify-center px-4 py-2.5 border-2 border-blue-600 text-sm font-bold rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all shadow-sm hover:shadow"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="min-h-[44px] flex-1 inline-flex items-center justify-center px-4 py-2.5 border-2 border-red-600 text-sm font-bold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all shadow-sm hover:shadow"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination - Touch-friendly */}
                  {pagination.lastPage > 1 && (
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 pt-6 border-t-2 border-gray-100">
                      <button
                        onClick={() => loadJobs(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="min-h-[44px] w-full sm:w-auto px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                      >
                        ← Previous
                      </button>
                      <span className="px-5 py-3 text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl border-2 border-blue-200 shadow-sm">
                        Page {pagination.currentPage} of {pagination.lastPage}
                      </span>
                      <button
                        onClick={() => loadJobs(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.lastPage}
                        className="min-h-[44px] w-full sm:w-auto px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showJobForm && (
        <JobForm
          job={editingJob}
          onClose={handleJobFormClose}
        />
      )}
    </div>
  );
};

export default DataEntryDashboard;
