import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import type { GeneratedDP } from '../types';

export const MyDPs: React.FC = () => {
  const { fetchGeneratedDPsByUser, deleteGeneratedDP } = useEvents();
  const { showToast } = useToast();
  const [dps, setDps] = useState<GeneratedDP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dpToDelete, setDpToDelete] = useState<GeneratedDP | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDPs, setTotalDPs] = useState(0);
  const dpsPerPage = 12;

  // Calculate total pages
  const totalPages = Math.ceil(totalDPs / dpsPerPage);

  useEffect(() => {
    loadUserDPs();
  }, [currentPage]);

  const loadUserDPs = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchGeneratedDPsByUser(currentPage, dpsPerPage);
      setDps(result.dps);
      setTotalDPs(result.totalCount);
    } catch (err) {
      console.error('Error loading user DPs:', err);
      setError('Failed to load your DPs');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (dp: GeneratedDP) => {
    try {
      const response = await fetch(dp.generated_image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Use the first text input for filename, or fallback to event title
      const fileName = dp.user_text_inputs && dp.user_text_inputs.length > 0 
        ? `${dp.event?.title || 'Event'}-DP-${dp.user_text_inputs[0]}.png`
        : `${dp.event?.title || 'Event'}-DP.png`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      showToast('DP downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error downloading DP:', err);
      showToast('Failed to download DP', 'error');
    }
  };

  const handleDeleteClick = (dp: GeneratedDP) => {
    setDpToDelete(dp);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!dpToDelete) return;

    try {
      setDeletingId(dpToDelete.id);
      await deleteGeneratedDP(dpToDelete.id);
      
      // Remove the deleted DP from the local state
      setDps(prev => prev.filter(item => item.id !== dpToDelete.id));
      setTotalDPs(prev => prev - 1);
      
      showToast('DP deleted successfully!', 'success');
      
      // If we deleted the last item on the current page and it's not the first page, go back one page
      if (dps.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error('Error deleting DP:', err);
      showToast('Failed to delete DP', 'error');
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setDpToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDpToDelete(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center text-sm text-gray-500">
          Showing {(currentPage - 1) * dpsPerPage + 1} to{' '}
          {Math.min(currentPage * dpsPerPage, totalDPs)} of {totalDPs} DPs
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {startPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                )}
              </>
            )}

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'text-primary bg-thistle border border-primary'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
        <div className="space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={loadUserDPs}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-primary">My Display Pictures</h1>
        <p className="text-secondary mt-2">
          All your generated event DPs in one place ({totalDPs} total)
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size={32} />
        </div>
      ) : totalDPs === 0 ? (
        <motion.div
          className="text-center py-16 bg-white rounded-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No DPs created yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by creating your first display picture from an event
          </p>
          <a
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
          >
            Browse Events
          </a>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Grid of DPs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {dps.map((dp, index) => (
              <motion.div
                key={dp.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                {/* DP Image */}
                <div className="aspect-square relative overflow-hidden bg-gray-200">
                  <img
                    src={dp.generated_image_url}
                    alt={`DP for ${dp.event?.title || 'event'}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handleDownload(dp)}
                      className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors"
                      title="Download DP"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(dp)}
                      disabled={deletingId === dp.id}
                      className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete DP"
                    >
                      {deletingId === dp.id ? (
                        <LoadingSpinner size={20} className="text-white" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* DP Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-primary truncate">
                    {dp.event?.title || 'Unknown Event'}
                  </h3>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(dp.created_at)}
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="md:hidden flex space-x-2 p-4 pt-0">
                  <button
                    onClick={() => handleDownload(dp)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteClick(dp)}
                    disabled={deletingId === dp.id}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {deletingId === dp.id ? (
                      <LoadingSpinner size={16} className="text-red-700" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          {renderPaginationControls()}
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Display Picture"
        description={`Are you sure you want to delete this DP for "${dpToDelete?.event?.title || 'this event'}"? This action cannot be undone.`}
        confirmText="Delete DP"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingId === dpToDelete?.id}
      />
    </div>
  );
};