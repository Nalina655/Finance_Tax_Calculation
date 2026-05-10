# Anishi Services - Accounting Management System

A complete, enterprise-grade accounting and financial management platform for small to medium businesses. This system handles sales, purchases, GST compliance, employee payroll, tax filings, and comprehensive financial reporting.

**Company Details:**
- Company Name: Anishi Services
- Contact: +91 9686849914
- Email: sharabha9686@gmail.com
- Software Subscription: ₹8,600/-

---

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [For New Users](#for-new-users)
3. [For Developers](#for-developers)
4. [Features & Calculations](#features--calculations)
5. [Data Upload Guide](#data-upload-guide)
6. [Formulas & Calculations](#formulas--calculations)
7. [Architecture Overview](#architecture-overview)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start Guide

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account (database)
- Email account for login

### Installation Steps

1. **Clone/Setup the Project**
   ```bash
   git clone <repository-url>
   cd anishi-services-accounting
   pnpm install
   ```

2. **Environment Setup**
   - Copy `.env.local.example` to `.env.local`
   - Add Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Run Development Server**
   ```bash
   pnpm dev
   ```
   - Open http://localhost:3000

4. **First Login**
   - Go to Sign Up page
   - Create account with your email
   - Confirm email (check inbox/spam folder)
   - Access dashboard

---

## For New Users

### Account Setup

#### Step 1: Register Your Account
1. Click **Sign Up** on the login page
2. Enter your email and password
3. Check your email for confirmation link
4. Click the confirmation link to activate account
5. Return to login and sign in

#### Step 2: Configure Company Settings
1. Go to **Settings** (gear icon on sidebar)
2. Fill in company information:
   - Company Name
   - Contact Number
   - Email Address
   - GST Number (if registered)
   - PAN Number
   - Address & Location
3. Click **Save Settings**

#### Step 3: Set Up GST (if applicable)
1. Go to **GST** → **Registration**
2. Click **Add New Registration**
3. Enter:
   - GST Registration Number
   - Registration Date
   - Financial Year
   - State Code
4. Save for future filings

---

### Daily Operations

#### Recording Sales
1. Go to **Accounting** → **Sales**
2. Click **Add New Sale Entry**
3. Fill in:
   - Invoice Number (auto-generated)
   - Invoice Date
   - Customer Name & GST Number
   - Item Description
   - Quantity & Unit Price
   - Tax Type (CGST, SGST, IGST)
4. System auto-calculates totals
5. Click **Save Entry**

#### Recording Purchases
1. Go to **Accounting** → **Purchases**
2. Click **Add New Purchase**
3. Fill in:
   - Bill Number
   - Bill Date
   - Vendor Name & GST Number
   - Item Description
   - Quantity & Unit Price
   - Tax percentages
4. System calculates tax amounts
5. Click **Save Entry**

#### Bank Reconciliation
1. Go to **Accounting** → **Bank Statement**
2. Click **Add Transaction**
3. Enter:
   - Bank Name & Account Number
   - Transaction Date
   - Debit/Credit Type
   - Amount
   - Description
4. Mark as reconciled once matched
5. System tracks unreconciled items

#### Journal Entries
1. Go to **Accounting** → **Journal Entries**
2. Click **New Entry**
3. Add:
   - Entry Date
   - Account Head
   - Debit/Credit Amounts
   - Reference Number
4. Save as Draft or Post immediately

#### Credit & Debit Notes
1. **Credit Notes** (sales returns): **Accounting** → **Credit Notes**
   - Related to original invoice
   - Reason for credit
   - Refund amount

2. **Debit Notes** (purchase returns): **Accounting** → **Debit Notes**
   - Related to original bill
   - Reason for debit

---

#### Employee Management
1. Go to **Payroll** → **Employees**
2. Click **Add New Employee**
3. Enter:
   - Employee Name & ID
   - Date of Joining
   - Salary Amount
   - PAN/Aadhar Numbers
   - ESI/PF Account Numbers
   - Bank Account Details
4. System stores for payroll processing

#### Monthly Payroll
1. Go to **Payroll** → **Payroll Records**
2. Click **Create Payroll**
3. Select month
4. System auto-calculates:
   - Gross Salary (based on components)
   - Deductions (PF, ESI, TDS)
   - Net Salary
5. Review and save

#### GST Filing
1. Go to **GST** → **GST Filings**
2. Click **New Filing**
3. Select:
   - Return Type (GSTR-1, GSTR-2, GSTR-3B, etc.)
   - Filing Period
   - Financial Year
4. System aggregates data from sales/purchases
5. Review totals and submit

---

### Viewing Reports

1. Go to **Reports**
2. Select date range
3. View summary statistics:
   - Total Sales
   - Total Purchases
   - Active Employees
   - Total GST
4. Generate specific reports:
   - Income Statement
   - Balance Sheet
   - GST Summary
   - Payroll Report
   - Sales/Purchase Reports
5. Download as CSV

---

## For Developers

### Database Schema Overview

The system uses **Supabase PostgreSQL** with the following tables:

```
company_settings
├── GST Registration & Settings
├── Sales/Purchase Entries
├── Bank Statements
├── Journal Entries
├── Credit/Debit Notes
└── Reconciliation Records

gst_registration
├── GST Registration Details
└── gst_filings (multiple filings per registration)

employees
├── Employee Master Data
└── employee_tax (tax records: TDS, PF, ESI, PT)
└── payroll_records (monthly payroll)
```

### Data Upload Workflow

#### For Bulk Data Import (CSV)

1. **Prepare CSV Files**
   - Sales Data: `sales_import.csv`
   - Purchase Data: `purchases_import.csv`
   - Employee Data: `employees_import.csv`

2. **CSV Format Examples**

   **sales_import.csv**
   ```csv
   invoice_number,invoice_date,customer_name,customer_gst,item_description,quantity,unit_price,subtotal,cgst_percent,sgst_percent
   INV001,2024-01-15,ABC Corp,18AABCT1234G1Z0,Service A,5,1000,5000,9,9
   INV002,2024-01-20,XYZ Ltd,27AABCU5055G1Z0,Product B,10,500,5000,9,9
   ```

   **purchases_import.csv**
   ```csv
   bill_number,bill_date,vendor_name,vendor_gst,item_description,quantity,unit_price,subtotal,cgst_percent,sgst_percent
   BILL001,2024-01-10,Supplier A,18AABCS1111G1Z0,Raw Material,100,100,10000,9,9
   ```

   **employees_import.csv**
   ```csv
   employee_id,employee_name,date_of_joining,salary,pan_number,esi_number,pf_account_number,bank_account_number,ifsc_code
   EMP001,Raj Kumar,2023-01-01,25000,ABCPK1234A,123456789,EMP0001,1234567890123456,SBIN0001234
   ```

3. **Validation Rules**
   - Dates must be in YYYY-MM-DD format
   - Amounts must be numeric (decimals allowed)
   - GST percentages: typically 5, 9, or 18
   - Invoice/Bill numbers must be unique
   - Employee IDs must be unique

4. **Upload Process**
   - Currently: Manual entry through UI forms
   - Future: Batch import API endpoint available
   - Data validation occurs on submission
   - Duplicates are rejected with error message

### API Endpoints (Planned)

Future API endpoints for programmatic access:

```
POST   /api/sales              - Create sales entry
GET    /api/sales              - List sales with filters
POST   /api/purchases          - Create purchase entry
GET    /api/purchases          - List purchases with filters
POST   /api/employees          - Create employee record
POST   /api/payroll            - Process payroll
GET    /api/reports/:type      - Generate report
POST   /api/gst/filing         - Submit GST filing
```

### Database Access

```typescript
// Server-side query example
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('sales_entries')
  .select('*')
  .eq('company_id', companyId)
  .gte('invoice_date', startDate)
```

### Adding Custom Fields

To add custom fields to any table:

1. Modify schema in Supabase dashboard
2. Update TypeScript types in `lib/types.ts`
3. Update form components accordingly
4. Add validation rules as needed

---

## Features & Calculations

### Accounting Module

#### Sales Entry Calculations
- **Subtotal** = Quantity × Unit Price
- **CGST Amount** = Subtotal × (CGST% / 100)
- **SGST Amount** = Subtotal × (SGST% / 100)
- **IGST Amount** = Subtotal × (IGST% / 100) [for inter-state]
- **Total Amount** = Subtotal + CGST + SGST (or IGST)

#### Purchase Entry Calculations
- Same formulas as sales
- Tracks vendor GST for input credit

#### Journal Entry
- Maintains debit = credit balance
- Tracks account-wise transactions
- Supports multiple account heads

#### Bank Reconciliation
- Matches bank transactions with entries
- Calculates variance amounts
- Tracks reconciliation status

---

### GST Management

#### GST Registration
- Stores registration number and date
- Tracks financial year
- Maintains state-wise configuration

#### GST Filing
- **GSTR-1**: Outward supplies (sales)
  ```
  Total Sales (by rate)
  = Sum of all sales for the period
  ```

- **GSTR-2**: Inward supplies (purchases)
  ```
  Total Purchases (by rate)
  = Sum of all purchases for the period
  ```

- **GSTR-3B**: Monthly reconciliation
  ```
  Output Tax (from GSTR-1)
  - Input Tax Credit (from GSTR-2)
  = Net GST Liability
  ```

---

### Payroll & Tax Module

#### Gross Salary Calculation
```
Gross Salary = Basic Salary 
            + Dearness Allowance 
            + House Rent Allowance 
            + Other Allowances
```

#### Deductions

**PF (Provident Fund) - 12% of Basic**
```
Employee PF = Basic Salary × 12%
Employer PF = Basic Salary × 12%
Total PF = Employee PF + Employer PF
```

**ESI (Employee State Insurance) - 0.75% of Gross** (if applicable)
```
ESI = Gross Salary × 0.75%
(Employer contribution: 3.25%)
```

**TDS (Tax Deducted at Source)** - Based on income slabs
```
Slab 1 (₹0-250K):        Nil
Slab 2 (₹250K-500K):     5% on amount above 250K
Slab 3 (₹500K-1000K):    20% on amount above 500K
Slab 4 (>₹1000K):        30% on amount above 1000K
```

**PT (Professional Tax)** - State-specific (usually ₹0-200/month)
```
PT = Fixed amount or percentage (state-dependent)
```

#### Net Salary Calculation
```
Net Salary = Gross Salary 
          - PF (Employee portion)
          - ESI
          - TDS
          - PT
          - Other Deductions
```

---

## Formulas & Calculations Reference

### Tax Calculations

#### IGST (Inter-state)
```
Used when: Seller and buyer in different states
IGST = Subtotal × (Rate% / 100)
Rate = 5%, 12%, or 18% based on product
```

#### CGST + SGST (Intra-state)
```
Used when: Seller and buyer in same state
CGST = Subtotal × (Rate% / 100)
SGST = Subtotal × (Rate% / 100)
Rate = Typically 9% each (total 18%), or 5% + 5% (total 10%), etc.
```

### Financial Ratios (for future reports)

**Gross Profit Margin**
```
= (Total Sales - Cost of Goods Sold) / Total Sales × 100%
```

**Net Profit Margin**
```
= Net Profit / Total Sales × 100%
```

**Current Ratio** (Assets / Liabilities)
```
= Current Assets / Current Liabilities
```

---

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 16 with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

### Project Structure
```
/app
  /auth          - Authentication pages (login, signup)
  /dashboard     - Main dashboard
  /accounting    - Sales, purchases, bank, journal, notes
  /gst          - GST registration & filings
  /payroll      - Employees, payroll, tax records
  /reports      - Financial reports
  /settings     - Company settings

/components    - Reusable UI components
/lib           - Utilities, Supabase clients
/public        - Static assets
```

### Key Features
✅ Multi-table accounting entries
✅ Automatic tax calculations
✅ GST compliance & filing
✅ Employee payroll processing
✅ Financial reporting
✅ Bank reconciliation
✅ Date-range filtering
✅ User authentication

---

## Email Confirmation Issue & Solutions

### Problem: Email Not Confirmed

If you're stuck on "Email confirmation pending":

#### Solution 1: Confirm Email (Production)
1. Check your email inbox and spam folder
2. Click the confirmation link sent by Supabase
3. Return and log in

#### Solution 2: Testing Without Email Confirmation
For development/testing, bypass email confirmation:

1. **Option A**: Disable email confirmation in Supabase
   - Go to Supabase Dashboard
   - Settings → Authentication → Email Configuration
   - Toggle off "Require email confirmation"
   - Re-register your account

2. **Option B**: Use a test email service
   - Use [Mailtrap](https://mailtrap.io) or [MailHog](https://github.com/mailhog/MailHog)
   - Create test credentials
   - Auto-confirm all test emails

3. **Option C**: Pre-confirm users via SQL
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'your-email@example.com';
   ```

#### Solution 3: Resend Confirmation Email
1. Delete your account
2. Re-register with same email
3. Check inbox again

---

## Troubleshooting

### Common Issues

**Q: Getting "Unauthorized" error?**
- Ensure you're logged in (check top-right)
- Email must be confirmed
- Session may have expired, try logging out and in again

**Q: Data not showing after entering?**
- Wait 2-3 seconds for database sync
- Refresh the page (F5)
- Check that you're viewing the correct date range
- Verify company settings are saved

**Q: Calculations seem wrong?**
- Verify GST percentages are correct
- Check that all amounts are numeric
- Ensure tax rates match your state

**Q: Can't upload bulk data?**
- Use CSV format as documented
- Check for duplicate invoice/employee IDs
- Verify date format (YYYY-MM-DD)
- All required fields must be filled

**Q: Performance is slow?**
- Large date ranges slow queries
- Try filtering by date range (e.g., last 90 days)
- Consider archiving old data
- Contact support if issue persists

---

## Support & Contact

**Issues or Questions?**
- Email: sharabha9686@gmail.com
- Phone: +91 9686849914
- Company: Anishi Services

**Reporting Bugs**
- Include error message (from browser console)
- Describe steps to reproduce
- Share date/time of issue

---

## Version Information

- **System Version**: 1.0.0
- **Last Updated**: May 2024
- **Node.js Required**: 18+
- **Database**: PostgreSQL (Supabase)

---

## License & Terms

This accounting software is proprietary to Anishi Services.
Subscription: ₹8,600/- per annum

All financial data is confidential and secured with Row-Level Security at the database level.
