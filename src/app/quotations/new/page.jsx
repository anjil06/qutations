'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  formatINR,
  getTodayDateString,
  getDefaultValidUntilDateString,
  generateQuotationNumber,
  calculateQuotationTotals,
  calculateLineItem,
} from '@/lib/utils';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import ProductRow from '@/components/ProductRow';
import { ArrowLeft, Plus, Save, AlertCircle } from '@/components/Icons';

export default function CreateQuotationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Customer Details Form State
  const [customer, setCustomer] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
  });

  // Quotation Meta Form State
  const [meta, setMeta] = useState({
    quotation_number: generateQuotationNumber(),
    quotation_date: getTodayDateString(),
    valid_until: getDefaultValidUntilDateString(),
  });

  // Product Items Form State (Starts with 1 row by default)
  const [items, setItems] = useState([
    {
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
    },
  ]);

  // Validation Errors State
  const [errors, setErrors] = useState({});

  // Product change handlers
  const handleProductChange = (index, field, value) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });

    // Clear field-specific error if corrected
    if (errors[`item_${index}_${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`item_${index}_${field}`];
        return next;
      });
    }
  };

  const handleAddProduct = () => {
    setItems((prev) => [
      ...prev,
      {
        product_name: '',
        quantity: 1,
        unit_price: 0,
        discount: 0,
      },
    ]);
  };

  const handleRemoveProduct = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    // Clear any errors for that index
    setErrors((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        if (!key.startsWith(`item_${index}_`)) {
          next[key] = prev[key];
        }
      });
      return next;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Customer validation
    if (!customer.customer_name.trim()) {
      newErrors.customer_name = 'Customer Name is required.';
    }

    if (!customer.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Quotation Details validation
    if (!meta.quotation_number.trim()) {
      newErrors.quotation_number = 'Quotation number is required.';
    }
    if (!meta.quotation_date) {
      newErrors.quotation_date = 'Quotation date is required.';
    }

    // Items validation
    if (items.length === 0) {
      newErrors.general = 'At least one product is required.';
    }

    items.forEach((item, index) => {
      if (!item.product_name || !item.product_name.trim()) {
        newErrors[`item_${index}_product_name`] = 'Product name is required.';
      }
      if (Number(item.quantity) <= 0 || isNaN(Number(item.quantity))) {
        newErrors[`item_${index}_quantity`] = 'Qty must be > 0.';
      }
      if (Number(item.unit_price) < 0 || isNaN(Number(item.unit_price))) {
        newErrors[`item_${index}_unit_price`] = 'Price cannot be negative.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Quotation Handler
  const handleSave = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      setGeneralError('Please fix the errors in the form before saving.');
      return;
    }

    try {
      setSaving(true);

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to save a quotation.');
      }

      // Calculate totals
      const { subtotal, gst, grandTotal } = calculateQuotationTotals(items);

      // 1. Insert quotation header
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotations')
        .insert({
          user_id: user.id,
          quotation_number: meta.quotation_number,
          customer_name: customer.customer_name.trim(),
          company_name: customer.company_name.trim() || null,
          email: customer.email.trim(),
          phone: customer.phone.trim() || null,
          quotation_date: meta.quotation_date,
          valid_until: meta.valid_until || null,
          subtotal,
          gst,
          total: grandTotal,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // 2. Insert quotation items
      const itemsToInsert = items.map((item) => {
        const { netAmount } = calculateLineItem(item);
        return {
          quotation_id: quoteData.id,
          product_name: item.product_name.trim(),
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          discount: Number(item.discount) || 0,
          amount: netAmount,
        };
      });

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Redirect to quotation list
      router.push('/quotations');
    } catch (err) {
      console.error('Error saving quotation:', err);
      setGeneralError(err.message || 'Failed to save quotation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, gst, grandTotal } = calculateQuotationTotals(items);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar showNewButton={false} />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/quotations"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Quotations
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              Create New Quotation
            </h1>
          </div>

          {generalError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Customer Details Card */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span>
                Customer Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customer.customer_name}
                    onChange={(e) => {
                      setCustomer({ ...customer, customer_name: e.target.value });
                      if (errors.customer_name) {
                        setErrors({ ...errors, customer_name: null });
                      }
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.customer_name
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:border-orange-500'
                    } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  />
                  {errors.customer_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.customer_name}
                    </p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech Solutions"
                    value={customer.company_name}
                    onChange={(e) =>
                      setCustomer({ ...customer, company_name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={customer.email}
                    onChange={(e) => {
                      setCustomer({ ...customer, email: e.target.value });
                      if (errors.email) {
                        setErrors({ ...errors, email: null });
                      }
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      errors.email
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:border-orange-500'
                    } focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Quotation Details Card */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span>
                Quotation Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Quotation Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quotation Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={meta.quotation_number}
                    onChange={(e) =>
                      setMeta({ ...meta, quotation_number: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold text-orange-600"
                  />
                </div>

                {/* Quotation Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quotation Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={meta.quotation_date}
                    onChange={(e) =>
                      setMeta({ ...meta, quotation_date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={meta.valid_until}
                    onChange={(e) =>
                      setMeta({ ...meta, valid_until: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Products Section */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span>
                  Products / Services
                </h2>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  + Add Product
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <ProductRow
                    key={index}
                    item={item}
                    index={index}
                    onChange={handleProductChange}
                    onRemove={handleRemoveProduct}
                    canRemove={items.length > 1}
                    error={{
                      product_name: errors[`item_${index}_product_name`],
                      quantity: errors[`item_${index}_quantity`],
                      unit_price: errors[`item_${index}_unit_price`],
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 4. Automatic Calculation Box & Action Button */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="text-xs text-gray-500 max-w-sm">
                <p>
                  * GST is calculated automatically at 18% on the subtotal.
                </p>
                <p className="mt-1">
                  * All amounts are formatted in Indian Rupee (INR).
                </p>
              </div>

              {/* Calculation Breakdown */}
              <div className="w-full sm:w-80 bg-orange-50/50 p-5 rounded-lg border border-orange-100">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span className="font-medium">{formatINR(gst)}</span>
                  </div>
                  <div className="border-t border-orange-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                    <span>Grand Total</span>
                    <span className="text-orange-600">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 pt-2">
              <Link
                href="/quotations"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-xs transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    <span>Save Quotation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
