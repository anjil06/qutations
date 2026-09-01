# QuoteNest

**Simple Quotation Management System**

QuoteNest is a simple web application for creating, calculating, storing, and viewing software quotations. It is designed as a beginner-friendly project using React and Supabase.

## Features

- User login with Supabase Authentication
- Create software quotations
- Add multiple products/services
- Automatic calculation of discount, subtotal, GST, and grand total
- Save quotations to Supabase
- View saved quotations
- Delete quotations
- Responsive orange-and-white UI

## Technology Stack

- React.js
- Vite
- JavaScript
- Tailwind CSS
- Supabase Authentication
- Supabase Database
- Vercel
- Git & GitHub

## Project Flow

```text
Login
  ↓
Quotation List
  ↓
Create Quotation
  ↓
Add Customer & Product Details
  ↓
Automatic Calculation
  ↓
Save to Supabase
  ↓
View Quotation
  ↓
Delete Quotation
```

## Test Login Credentials

Use the following credentials to test the application:

**Email:** `test@gmail.com`  
**Password:** `test@1234`

## Environment Variables

A `.env.example` file should also be included:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lrxdkmxeaenzmecyebti.supabase.co   
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1ohWxukhrHuQJytOYt5qnw_l8WUJSqU
```

Never commit the real `.env` file or Supabase service-role key to GitHub.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/anjil06/qutations.git
cd qutations
npm install
```

Start the development server:

```bash
npm run dev
```

The application will run locally using the URL shown by Vite.

## Quotation Calculation

The application uses:

- **Gross Amount** = Quantity × Unit Price
- **Discount Amount** = Gross Amount × Discount %
- **Net Amount** = Gross Amount − Discount Amount
- **Subtotal** = Sum of all Net Amounts
- **GST** = Subtotal × 18%
- **Grand Total** = Subtotal + GST

All prices are displayed in Indian Rupees (₹).

## Database Structure

### quotations

```text
id
user_id
quotation_number
customer_name
company_name
email
phone
quotation_date
valid_until
subtotal
gst
total
created_at
```

### quotation_items

```text
id
quotation_id
product_name
quantity
unit_price
discount
amount
```

## Notes

This project focuses on the core quotation-management requirements and keeps the implementation simple enough for a junior developer to understand and maintain.
