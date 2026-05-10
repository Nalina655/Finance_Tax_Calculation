# Developer Guide - Anishi Services Accounting System

## For Developers Extending This System

---

## Architecture Overview

### Tech Stack
```
Frontend:    Next.js 16 + React 19 + TypeScript
Styling:     Tailwind CSS v4 + shadcn/ui
Database:    Supabase PostgreSQL
Auth:        Supabase Auth (Email/Password)
Icons:       Lucide React
State:       React Hooks (useState, useEffect)
API:         RESTful via Supabase RPC/PostgREST
```

### Project Structure
```
anishi-services/
├── app/
│   ├── auth/                  # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── callback/
│   │   └── error/
│   ├── dashboard/             # Main dashboard
│   ├── accounting/            # Accounting module
│   │   ├── sales/
│   │   ├── purchases/
│   │   ├── bank/
│   │   ├── journal/
│   │   ├── credit-notes/
│   │   └── debit-notes/
│   ├── gst/                   # GST module
│   │   ├── registration/
│   │   └── filings/
│   ├── payroll/               # Payroll module
│   │   ├── employees/
│   │   ├── records/
│   │   └── tax/
│   ├── reports/               # Reporting
│   ├── settings/              # Settings
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── sidebar.tsx
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts
│   └── utils.ts
├── middleware.ts
├── package.json
└── README.md
```

---

## Database Schema Details

### Core Tables & Relationships

```
company_settings (1)
  ├─→ gst_registration (*)
  │     └─→ gst_filings (*)
  ├─→ employees (*)
  │     ├─→ employee_tax (*)
  │     └─→ payroll_records (*)
  ├─→ sales_entries (*)
  ├─→ purchase_entries (*)
  ├─→ credit_notes (*)
  ├─→ debit_notes (*)
  ├─→ bank_statements (*)
  ├─→ journal_entries (*)
  └─→ reconciliation_entries (*)
```

### Table Schemas

#### 1. company_settings
```sql
id (UUID) PRIMARY KEY
company_name (VARCHAR)
email (VARCHAR)
contact_number (VARCHAR)
address (TEXT)
city, state, pincode (VARCHAR)
pan, gst_number (VARCHAR)
created_at, updated_at (TIMESTAMP)
```

#### 2. gst_registration
```sql
id (UUID) PRIMARY KEY
company_id (UUID) FK → company_settings
gst_registration_number (VARCHAR) UNIQUE
registration_date (DATE)
registration_status (VARCHAR)
financial_year (VARCHAR)
state_code (VARCHAR)
document_url (TEXT)
created_at, updated_at (TIMESTAMP)
```

#### 3. employees
```sql
id (UUID) PRIMARY KEY
company_id (UUID) FK
employee_id (VARCHAR) UNIQUE
employee_name, email, phone (VARCHAR)
date_of_joining, date_of_leaving (DATE)
designation, department (VARCHAR)
salary (DECIMAL)
pan_number, aadhar_number (VARCHAR)
esi_number, pf_account_number (VARCHAR)
bank_account_number, ifsc_code (VARCHAR)
status (VARCHAR) - Active/Inactive
created_at, updated_at (TIMESTAMP)
```

#### 4. payroll_records
```sql
id (UUID) PRIMARY KEY
employee_id (UUID) FK
payroll_month (DATE)
basic_salary (DECIMAL)
dearness_allowance, house_rent_allowance (DECIMAL)
other_allowances (DECIMAL)
gross_salary (DECIMAL)
pf_deduction, esi_deduction (DECIMAL)
tax_deduction, other_deductions (DECIMAL)
net_salary (DECIMAL)
payment_date (DATE)
payment_mode (VARCHAR) - Bank/Cash/Cheque
status (VARCHAR) - Pending/Processed/Paid
created_at, updated_at (TIMESTAMP)
```

#### 5. sales_entries
```sql
id (UUID) PRIMARY KEY
company_id (UUID) FK
invoice_number (VARCHAR) UNIQUE
invoice_date (DATE)
customer_name, customer_gst_number (VARCHAR)
item_description (TEXT)
quantity, unit_price (DECIMAL)
subtotal, igst_amount, cgst_amount, sgst_amount (DECIMAL)
total_amount (DECIMAL)
payment_status (VARCHAR) - Unpaid/Partial/Paid
payment_method (VARCHAR)
notes (TEXT)
created_at, updated_at (TIMESTAMP)
```

---

## API Patterns

### Server-Side Data Fetching

```typescript
// app/accounting/sales/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function SalesPage() {
  const supabase = await createClient()
  
  const { data: company } = await supabase
    .from('company_settings')
    .select('id')
    .limit(1)
    .single()
  
  if (!company) return <div>No company found</div>
  
  const { data: sales, error } = await supabase
    .from('sales_entries')
    .select('*')
    .eq('company_id', company.id)
    .order('invoice_date', { ascending: false })
  
  return <div>{/* render sales */}</div>
}
```

### Client-Side Data Operations

```typescript
// 'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Create
const { data, error } = await supabase
  .from('sales_entries')
  .insert([{ invoice_number, customer_name, ... }])
  .select()

// Read
const { data } = await supabase
  .from('sales_entries')
  .select('*')
  .eq('company_id', companyId)

// Update
const { data, error } = await supabase
  .from('sales_entries')
  .update({ payment_status: 'Paid' })
  .eq('id', entryId)

// Delete
const { error } = await supabase
  .from('sales_entries')
  .delete()
  .eq('id', entryId)
```

---

## Calculation Functions

### Tax Calculations

```typescript
// utils/calculations.ts

export function calculateGST(
  subtotal: number,
  cgstRate: number = 9,
  sgstRate: number = 9,
  igstRate: number = 0
) {
  const cgst = subtotal * (cgstRate / 100)
  const sgst = subtotal * (sgstRate / 100)
  const igst = subtotal * (igstRate / 100)
  
  return {
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    total: cgst + sgst + igst
  }
}

export function calculateTotalAmount(
  subtotal: number,
  gst: { cgst: number, sgst: number, igst: number }
) {
  return subtotal + gst.cgst + gst.sgst + gst.igst
}
```

### Payroll Calculations

```typescript
export function calculatePayroll(employee: Employee) {
  const grossSalary = employee.basicSalary 
    + employee.dearness 
    + employee.hra 
    + employee.otherAllowances
  
  const pfDeduction = employee.basicSalary * 0.12
  const esiDeduction = employee.grossSalary * 0.0075
  const tdsDeduction = calculateTDS(grossSalary)
  const ptDeduction = calculatePT(grossSalary)
  
  const netSalary = grossSalary 
    - pfDeduction 
    - esiDeduction 
    - tdsDeduction 
    - ptDeduction
  
  return {
    grossSalary,
    pfDeduction,
    esiDeduction,
    tdsDeduction,
    ptDeduction,
    netSalary
  }
}

function calculateTDS(income: number): number {
  if (income <= 250000) return 0
  if (income <= 500000) return (income - 250000) * 0.05
  if (income <= 1000000) return 12500 + (income - 500000) * 0.20
  return 112500 + (income - 1000000) * 0.30
}

function calculatePT(income: number): number {
  // State-dependent, example: Maharashtra
  if (income <= 75000) return 0
  if (income <= 100000) return 100
  if (income <= 150000) return 150
  return 200
}
```

---

## Adding New Features

### Adding a New Page

1. **Create Route**
   ```
   app/new-feature/page.tsx
   ```

2. **Import Components**
   ```typescript
   'use client'
   import { Card } from '@/components/ui/card'
   import { Button } from '@/components/ui/button'
   ```

3. **Add to Sidebar**
   Edit `components/sidebar.tsx` and add link

### Adding a New Database Table

1. **Create Table via Supabase SQL**
   ```sql
   CREATE TABLE new_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     company_id UUID REFERENCES company_settings(id),
     field1 VARCHAR,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   ```

2. **Add TypeScript Type**
   ```typescript
   // lib/types.ts
   export interface NewTable {
     id: string
     company_id: string
     field1: string
     created_at: string
   }
   ```

3. **Create CRUD Operations**
   ```typescript
   // lib/supabase/queries.ts
   export async function createNewTableEntry(data: NewTable) {
     const supabase = createClient()
     return await supabase.from('new_table').insert([data])
   }
   ```

---

## Common Tasks

### Generate Invoice Number

```typescript
export async function generateInvoiceNumber(
  supabase: any,
  companyId: string
): Promise<string> {
  const { data: lastInvoice } = await supabase
    .from('sales_entries')
    .select('invoice_number')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  const lastNum = lastInvoice?.invoice_number 
    ? parseInt(lastInvoice.invoice_number.replace('INV', '')) 
    : 0
  
  return `INV${String(lastNum + 1).padStart(6, '0')}`
}
```

### Validate GST Number

```typescript
export function validateGSTNumber(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstRegex.test(gst.toUpperCase())
}
```

### Validate PAN Number

```typescript
export function validatePANNumber(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan.toUpperCase())
}
```

---

## Testing

### Unit Test Example

```typescript
// __tests__/calculations.test.ts
import { calculateGST } from '@/lib/utils/calculations'

describe('calculateGST', () => {
  it('calculates CGST + SGST correctly', () => {
    const result = calculateGST(1000, 9, 9, 0)
    expect(result.cgst).toBe(90)
    expect(result.sgst).toBe(90)
    expect(result.total).toBe(180)
  })
  
  it('calculates IGST correctly', () => {
    const result = calculateGST(1000, 0, 0, 18)
    expect(result.igst).toBe(180)
    expect(result.total).toBe(180)
  })
})
```

---

## Performance Optimization

### Use Server Components for Data Fetching

```typescript
// ✅ Good - Server Component
export default async function SalesPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('sales_entries').select()
  return <div>{/* render */}</div>
}

// ❌ Avoid - Client-side fetching
export default function SalesPage() {
  const [data, setData] = useState([])
  useEffect(() => { /* fetch */ }, [])
  return <div>{/* render */}</div>
}
```

### Index Key Columns

```sql
-- Already done in schema, but if adding new tables:
CREATE INDEX idx_company_id ON sales_entries(company_id)
CREATE INDEX idx_invoice_date ON sales_entries(invoice_date)
CREATE INDEX idx_employee_id ON payroll_records(employee_id)
```

---

## Debugging

### Enable Debugging Logs

```typescript
// In any component:
console.log('[v0] Fetching sales data...')
const { data, error } = await supabase
  .from('sales_entries')
  .select('*')

if (error) {
  console.error('[v0] Error:', error.message)
}
console.log('[v0] Data fetched:', data)
```

### Check Supabase Logs

Go to Supabase Dashboard → Logs to view:
- API requests
- Database queries
- Authentication events
- Error messages

---

## Deployment

### Environment Variables

```env
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...

# Production (set in hosting provider)
NEXT_PUBLIC_SUPABASE_URL=production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key
```

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Feature: Add new accounting feature"
git push origin main

# Vercel auto-deploys on push
# Or manually:
vercel deploy --prod
```

---

## Security Best Practices

1. **Always use Row-Level Security (RLS)**
   ```sql
   ALTER TABLE sales_entries ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "users_own_sales" ON sales_entries
   FOR SELECT USING (company_id = auth.uid());
   ```

2. **Validate User Input**
   ```typescript
   if (!email.includes('@')) {
     throw new Error('Invalid email')
   }
   ```

3. **Never Expose Secrets**
   - ANON_KEY is safe to expose (public)
   - SERVICE_KEY must stay secret

4. **Use HTTPS Only**
   - All production URLs must be HTTPS
   - Never store passwords in plain text

---

## Troubleshooting

### "Auth session missing"
- Check middleware.ts is applied
- Ensure cookies are enabled
- Try incognito window

### "RLS policy violation"
- User must have `company_id` matching
- Check RLS policies are correct
- Verify auth.uid() is set

### "Slow queries"
- Add indexes to frequently searched columns
- Use date range filters
- Limit results with `.limit(100)`

---

## Future Enhancements

- [ ] Multi-user support
- [ ] API endpoints for integrations
- [ ] Bulk import from CSV/Excel
- [ ] Email export of reports
- [ ] Scheduled automated reports
- [ ] WhatsApp integration for alerts
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Recurring transaction support
- [ ] Budget vs actual analysis

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## Support

For technical issues:
- Email: sharabha9686@gmail.com
- Create issue in GitHub repo
- Contact development team
