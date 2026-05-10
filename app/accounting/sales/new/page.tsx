'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewSalesEntryPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerGstNumber: '',
    itemDescription: '',
    quantity: '',
    unitPrice: '',
    igstAmount: '0',
    cgstAmount: '0',
    sgstAmount: '0',
    paymentMethod: 'Bank Transfer',
    notes: '',
  })

  const calculateTotals = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const unitPrice = parseFloat(formData.unitPrice) || 0
    const subtotal = quantity * unitPrice
    const igst = parseFloat(formData.igstAmount) || 0
    const cgst = parseFloat(formData.cgstAmount) || 0
    const sgst = parseFloat(formData.sgstAmount) || 0
    const totalAmount = subtotal + igst + cgst + sgst

    return { subtotal, totalAmount }
  }

  const { subtotal, totalAmount } = calculateTotals()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get company ID from company_settings
      const { data: company } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .single()

      if (!company) {
        throw new Error('Company not set up. Please configure company settings.')
      }

      const { error: insertError } = await supabase.from('sales_entries').insert({
        company_id: company.id,
        invoice_number: formData.invoiceNumber,
        invoice_date: formData.invoiceDate,
        customer_name: formData.customerName,
        customer_gst_number: formData.customerGstNumber || null,
        item_description: formData.itemDescription,
        quantity: parseFloat(formData.quantity),
        unit_price: parseFloat(formData.unitPrice),
        subtotal: subtotal,
        igst_amount: parseFloat(formData.igstAmount),
        cgst_amount: parseFloat(formData.cgstAmount),
        sgst_amount: parseFloat(formData.sgstAmount),
        total_amount: totalAmount,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
      })

      if (insertError) {
        throw insertError
      }

      router.push('/accounting/sales')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create sales entry')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Sales Invoice</h1>
        <p className="text-gray-600 mt-2">Record a new sales transaction</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number *</label>
              <Input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="INV-001"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date *</label>
              <Input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <Input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Customer name"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer GST Number</label>
              <Input
                type="text"
                name="customerGstNumber"
                value={formData.customerGstNumber}
                onChange={handleChange}
                placeholder="GST number"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Description *</label>
            <Input
              type="text"
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleChange}
              placeholder="Product or service description"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
              <Input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
              <Input
                type="number"
                value={subtotal.toFixed(2)}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4">Tax Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IGST Amount</label>
                <Input
                  type="number"
                  name="igstAmount"
                  value={formData.igstAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CGST Amount</label>
                <Input
                  type="number"
                  name="cgstAmount"
                  value={formData.cgstAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SGST Amount</label>
                <Input
                  type="number"
                  name="sgstAmount"
                  value={formData.sgstAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">Total Amount</h3>
            <p className="text-3xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <Input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Sales Invoice'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
