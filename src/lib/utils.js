/**
 * Format a number into Indian Rupee (INR) currency string
 * e.g. 56050 -> ₹56,050 or ₹56,050.00
 */
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date to YYYY-MM-DD or readable Indian format (e.g. 24 Oct 2024)
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get current date in YYYY-MM-DD format for inputs
 */
export function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get date 30 days from now in YYYY-MM-DD format
 */
export function getDefaultValidUntilDateString() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

/**
 * Generate a clean sequential/random quotation number (e.g., QT-101)
 */
export function generateQuotationNumber() {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `QT-${randomNum}`;
}

/**
 * Calculate single product line item math:
 * Gross = Quantity * Unit Price
 * Discount Amount = Gross * Discount% / 100
 * Net Amount = Gross - Discount Amount
 */
export function calculateLineItem(item) {
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const unitPrice = Math.max(0, Number(item.unit_price) || 0);
  const discountPercent = Math.min(100, Math.max(0, Number(item.discount) || 0));

  const gross = quantity * unitPrice;
  const discountAmount = (gross * discountPercent) / 100;
  const netAmount = gross - discountAmount;

  return {
    gross,
    discountAmount,
    netAmount: Math.round(netAmount * 100) / 100,
  };
}

/**
 * Calculate totals for the entire quotation:
 * Subtotal = Sum of Net Amounts
 * GST (18%) = Subtotal * 18 / 100
 * Grand Total = Subtotal + GST
 */
export function calculateQuotationTotals(items = []) {
  const subtotal = items.reduce((acc, item) => {
    const { netAmount } = calculateLineItem(item);
    return acc + netAmount;
  }, 0);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const gst = Math.round(roundedSubtotal * 18) / 100;
  const grandTotal = Math.round((roundedSubtotal + gst) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    gst,
    grandTotal,
  };
}
