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
      case 'Shipped from Singapore':
        return 'bg-blue-100 text-blue-800';
      case 'Singapore Processing':
        return 'bg-purple-100 text-purple-800';
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Entry Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage jobs data</p>
          </div>

          {/* Jobs Management */}
          <div>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Jobs ({pagination.total})</h2>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Job
                </button>
              </div>

              {/* Search Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Search Jobs</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Search by job number, customer name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading}
                      className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Search
                    </button>
                    {searchQuery && (
                      <button
                        onClick={handleReset}
                        className="min-h-[44px] px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Received</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {jobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.job_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.customer.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.shipping_method || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(job.final_received_date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditJob(job)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                                aria-label="Edit job"
                              >
                                <Edit className="h-4 w-4 inline" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-red-600 hover:text-red-900"
                                aria-label="Delete job"
                              >
                                <Trash2 className="h-4 w-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet Card View */}
                  <div className="lg:hidden space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <h3 className="text-base font-semibold text-gray-900 truncate">{job.job_number}</h3>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{job.customer.name}</p>
                          </div>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600 mb-3">
                          <div className="flex justify-between">
                            <span className="font-medium">Shipping:</span>
                            <span>{job.shipping_method || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Final Received:</span>
                            <span>{formatDate(job.final_received_date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="min-h-[44px] flex-1 inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="min-h-[44px] flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                    <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                      <button
                        onClick={() => loadJobs(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="min-h-[44px] w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-700 font-medium">
                        Page {pagination.currentPage} of {pagination.lastPage}
                      </span>
                      <button
                        onClick={() => loadJobs(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.lastPage}
                        className="min-h-[44px] w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
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
