'use client';

import { Trash2 } from '@/components/Icons';
import { formatINR, calculateLineItem } from '@/lib/utils';

export default function ProductRow({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
  error = {},
}) {
  const { gross, discountAmount, netAmount } = calculateLineItem(item);

  return (
    <div className="p-4 bg-white rounded-lg border border-brand-border hover:border-orange-200 transition-colors shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        {/* Product / Service Name */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Product / Service Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Website Development"
            value={item.product_name || ''}
            onChange={(e) => onChange(index, 'product_name', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-md border ${
              error.product_name ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-orange-500'
            } focus:outline-none focus:ring-1 focus:ring-orange-500`}
          />
          {error.product_name && (
            <p className="text-xs text-red-500 mt-1">{error.product_name}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Qty <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="1"
            value={item.quantity === 0 ? '' : item.quantity}
            onChange={(e) => onChange(index, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
            className={`w-full px-3 py-2 text-sm rounded-md border ${
              error.quantity ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-orange-500'
            } focus:outline-none focus:ring-1 focus:ring-orange-500`}
          />
          {error.quantity && (
            <p className="text-xs text-red-500 mt-1">{error.quantity}</p>
          )}
        </div>

        {/* Unit Price */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Unit Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={item.unit_price === 0 ? '' : item.unit_price}
            onChange={(e) => onChange(index, 'unit_price', e.target.value === '' ? '' : Number(e.target.value))}
            className={`w-full px-3 py-2 text-sm rounded-md border ${
              error.unit_price ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-orange-500'
            } focus:outline-none focus:ring-1 focus:ring-orange-500`}
          />
          {error.unit_price && (
            <p className="text-xs text-red-500 mt-1">{error.unit_price}</p>
          )}
        </div>

        {/* Discount % */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Discount %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            placeholder="0"
            value={item.discount === 0 ? '' : item.discount}
            onChange={(e) => onChange(index, 'discount', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Amount & Delete Button */}
        <div className="sm:col-span-2 flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-6">
          <div className="text-right">
            <div className="text-xs text-gray-400 font-medium">Net Amount</div>
            <div className="text-sm font-semibold text-gray-800">
              {formatINR(netAmount)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            title={canRemove ? "Remove product" : "At least one product is required"}
            className={`p-2 rounded-md transition-colors ${
              canRemove
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                : 'text-gray-200 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
