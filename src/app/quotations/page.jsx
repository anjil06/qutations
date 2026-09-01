'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatINR, formatDate } from '@/lib/utils';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { Plus, Eye, Trash2, AlertTriangle, FileText } from '@/components/Icons';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  async function fetchQuotations() {
    try {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setErrorMsg('Failed to load quotations. Please ensure your Supabase tables are set up.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuotations((prev) => prev.filter((q) => q.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting quotation:', err);
      alert('Failed to delete quotation: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar showNewButton={true} />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Banner */}
          <div className="sm:flex sm:items-center sm:justify-between mb-8 pb-4 border-b border-brand-border">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Quotations
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View, manage, and create software quotations for your clients.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/quotations/new"
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                + New Quotation
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-500">Loading quotations...</p>
            </div>
          ) : quotations.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-brand-border rounded-xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 mx-auto bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No quotations found
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first software quotation for a client.
              </p>
              <div className="mt-6">
                <Link
                  href="/quotations/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Quotation
                </Link>
              </div>
            </div>
          ) : (
            /* Table of Quotations */
            <div className="bg-white border border-brand-border rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Quotation No.
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotations.map((q) => (
                      <tr
                        key={q.id}
                        className="hover:bg-orange-50/40 transition-colors"
                      >
                        {/* Quotation No */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-orange-600 text-sm">
                            {q.quotation_number}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {q.customer_name}
                          </div>
                          {q.company_name && (
                            <div className="text-xs text-gray-500">
                              {q.company_name}
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatINR(q.total)}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(q.quotation_date)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link
                            href={`/quotations/${q.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(q.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
              <div className="flex items-center space-x-3 text-red-600 mb-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Quotation
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this quotation? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={deletingId !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center"
                >
                  {deletingId ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  ) : null}
                  <span>{deletingId ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
