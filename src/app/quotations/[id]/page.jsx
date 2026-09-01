'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatINR, formatDate } from '@/lib/utils';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Printer, FileText, Building, Mail, Phone, MapPin, Globe } from '@/components/Icons';

export default function ViewQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id;

  const [quotation, setQuotation] = useState(null);
  const [items, setItems] = useState([]);
  const [senderProfile, setSenderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!quotationId) return;

    async function loadQuotationData() {
      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Fetch quotation
        const { data: quoteData, error: quoteError } = await supabase
          .from('quotations')
          .select('*')
          .eq('id', quotationId)
          .single();

        if (quoteError) throw quoteError;
        setQuotation(quoteData);

        // 2. Fetch quotation items
        const { data: itemsData, error: itemsError } = await supabase
          .from('quotation_items')
          .select('*')
          .eq('quotation_id', quotationId);

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        // 3. Fetch user profile for sender details
        if (quoteData?.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', quoteData.user_id)
            .maybeSingle();

          if (profileData) {
            setSenderProfile(profileData);
          }
        }
      } catch (err) {
        console.error('Error loading quotation:', err);
        setErrorMsg('Quotation not found or unable to load.');
      } finally {
        setLoading(false);
      }
    }

    loadQuotationData();
  }, [quotationId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar showNewButton={true} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6 no-print">
            <Link
              href="/quotations"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Quotations
            </Link>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 mr-2 text-gray-500" />
              Print Quotation
            </button>
          </div>

          {/* Loading / Error States */}
          {loading ? (
            <div className="bg-white rounded-xl p-16 border border-brand-border text-center shadow-xs">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-sm text-gray-500">Loading quotation details...</p>
            </div>
          ) : errorMsg ? (
            <div className="bg-white rounded-xl p-12 border border-brand-border text-center shadow-xs">
              <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
              <Link
                href="/quotations"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600"
              >
                Back to Quotations
              </Link>
            </div>
          ) : (
            /* Professional Quotation Document Card */
            <div className="bg-white border border-brand-border rounded-xl shadow-xs overflow-hidden print-card p-8 sm:p-12">
              {/* Quotation Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-gray-200 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">
                      Quote<span className="text-orange-500">Nest</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Simple Quotation Management
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-md text-xs font-bold uppercase tracking-wider mb-1 border border-orange-200">
                    SOFTWARE QUOTATION
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {quotation.quotation_number}
                  </div>
                </div>
              </div>

              {/* Sender & Customer & Meta Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-b border-gray-100">
                {/* Quotation From (Sender) */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    From
                  </h3>
                  <div className="text-sm font-bold text-gray-900">
                    {senderProfile?.company_name || senderProfile?.full_name || 'Service Provider'}
                  </div>
                  {senderProfile?.tagline && (
                    <div className="text-xs text-gray-500 mt-0.5 italic">
                      {senderProfile.tagline}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    {senderProfile?.email && <div>{senderProfile.email}</div>}
                    {senderProfile?.phone && <div>{senderProfile.phone}</div>}
                    {senderProfile?.address && <div>{senderProfile.address}, {senderProfile.city}</div>}
                    {senderProfile?.gstin && (
                      <div className="font-semibold text-gray-800 uppercase">
                        GSTIN: {senderProfile.gstin}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quotation To (Customer) */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Quotation For
                  </h3>
                  <div className="text-sm font-bold text-gray-900">
                    {quotation.customer_name}
                  </div>
                  {quotation.company_name && (
                    <div className="text-xs font-medium text-gray-700 mt-0.5">
                      {quotation.company_name}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    {quotation.email && <div>{quotation.email}</div>}
                    {quotation.phone && <div>{quotation.phone}</div>}
                  </div>
                </div>

                {/* Quotation Meta */}
                <div className="sm:text-right">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Quotation Details
                  </h3>
                  <div className="text-xs space-y-1.5 text-gray-600">
                    <div>
                      <span className="text-gray-400">Date: </span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(quotation.quotation_date)}
                      </span>
                    </div>
                    {quotation.valid_until && (
                      <div>
                        <span className="text-gray-400">Valid Until: </span>
                        <span className="font-semibold text-gray-900">
                          {formatDate(quotation.valid_until)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="py-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Product / Service
                      </th>
                      <th className="py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-4 text-sm font-medium text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="py-4 text-sm text-gray-600 text-right">
                          {item.quantity}
                        </td>
                        <td className="py-4 text-sm text-gray-600 text-right">
                          {formatINR(item.unit_price)}
                        </td>
                        <td className="py-4 text-sm text-gray-600 text-right">
                          {item.discount > 0 ? `${item.discount}%` : '-'}
                        </td>
                        <td className="py-4 text-sm font-semibold text-gray-900 text-right">
                          {formatINR(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <div className="w-full sm:w-72 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatINR(quotation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span className="font-medium">{formatINR(quotation.gst)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span className="text-orange-600">
                      {formatINR(quotation.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms / Footer Note */}
              <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                Thank you for your business. For questions regarding this quotation, please contact support.
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
