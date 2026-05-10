'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewGSTFilingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    gstReturnType: 'GSTR-1',
    financialYear: new Date().getFullYear().toString(),
    returnPeriod: '',
    filingDate: new Date().toISOString().split('T')[0],
    totalTaxAmount: '',
    description: '',
  })

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

      const { data: company } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .single()

      if (!company) {
        throw new Error('Company not set up. Please configure company settings.')
      }

      const { data: registration } = await supabase
        .from('gst_registration')
        .select('id')
        .eq('company_id', company.id)
        .limit(1)
        .single()

      if (!registration) {
        throw new Error('GST Registration not found. Please register for GST first.')
      }

      const { error: insertError } = await supabase.from('gst_filings').insert({
        gst_registration_id: registration.id,
        gst_return_type: formData.gstReturnType,
        financial_year: formData.financialYear,
        return_period: formData.returnPeriod,
        filing_date: formData.filingDate,
        total_tax_amount: parseFloat(formData.totalTaxAmount),
        description: formData.description || null,
        status: 'Pending',
      })

      if (insertError) {
        throw insertError
      }

      router.push('/gst/filings')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to file GST return')
      setLoading(false)
    }
  }

  const returnTypes = ['GSTR-1', 'GSTR-2', 'GSTR-3', 'GSTR-3B', 'GSTR-4', 'GSTR-5', 'GSTR-6', 'GSTR-7', 'GSTR-8', 'GSTR-9']

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">File GST Return</h1>
        <p className="text-gray-600 mt-2">Submit your GST return filing</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Return Type *</label>
            <select
              name="gstReturnType"
              value={formData.gstReturnType}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {returnTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              GSTR-1: Outward supplies | GSTR-2: Inward supplies | GSTR-3B: Monthly return
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year *</label>
              <Input
                type="text"
                name="financialYear"
                value={formData.financialYear}
                onChange={handleChange}
                placeholder="2024-2025"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Period *</label>
              <Input
                type="text"
                name="returnPeriod"
                value={formData.returnPeriod}
                onChange={handleChange}
                placeholder="Jan 2024 or Q1 FY2024"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filing Date *</label>
              <Input
                type="date"
                name="filingDate"
                value={formData.filingDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Tax Amount *</label>
              <Input
                type="number"
                name="totalTaxAmount"
                value={formData.totalTaxAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description/Notes</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any notes about this filing..."
              rows={4}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Filing...' : 'File GST Return'}
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
