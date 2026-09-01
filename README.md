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

**Email:** `anjilreddy06@gmail.com`  
**Password:** `YOUR_TEST_PASSWORD`

> Replace `YOUR_TEST_PASSWORD` with the password of the test account before submitting the project. Do not publish a real personal account password in a public GitHub repository.

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

A `.env.example` file should also be included:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never commit the real `.env` file or Supabase service-role key to GitHub.

## Installation

Clone the repository and install dependencies:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd quotenest
npm install
```

Start the development server:

```bash
npm run dev
```

The application will run locally using the URL shown by Vite.

## Supabase Setup

1. Create a Supabase project.
2. Enable Email/Password Authentication.
3. Create the `quotations` table.
4. Create the `quotation_items` table.
5. Add the required relationship between quotations and quotation items.
6. Configure Row Level Security so authenticated users can access their own quotations.
7. Add the Supabase URL and anonymous key to `.env`.

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