'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function NewGSTRegistrationPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    gstNumber: '',
    registrationDate: new Date().toISOString().split('T')[0],
    financialYear: new Date().getFullYear().toString(),
    stateCode: '',
    documentUrl: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      const { error: insertError } = await supabase.from('gst_registration').insert({
        company_id: company.id,
        gst_registration_number: formData.gstNumber,
        registration_date: formData.registrationDate,
        financial_year: formData.financialYear,
        state_code: formData.stateCode,
        document_url: formData.documentUrl || null,
        registration_status: 'Active',
      })

      if (insertError) {
        throw insertError
      }

      // Update company settings with GST number
      await supabase
        .from('company_settings')
        .update({ gst_number: formData.gstNumber })
        .eq('id', company.id)

      router.push('/gst/registration')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to register GST')
      setLoading(false)
    }
  }

  const stateCodes = [
    { code: '01', name: 'Andhra Pradesh' },
    { code: '02', name: 'Arunachal Pradesh' },
    { code: '03', name: 'Assam' },
    { code: '04', name: 'Bihar' },
    { code: '05', name: 'Chhattisgarh' },
    { code: '06', name: 'Goa' },
    { code: '07', name: 'Gujarat' },
    { code: '08', name: 'Haryana' },
    { code: '09', name: 'Himachal Pradesh' },
    { code: '10', name: 'Jharkhand' },
    { code: '11', name: 'Karnataka' },
    { code: '12', name: 'Kerala' },
    { code: '13', name: 'Madhya Pradesh' },
    { code: '14', name: 'Maharashtra' },
    { code: '15', name: 'Manipur' },
    { code: '16', name: 'Meghalaya' },
    { code: '17', name: 'Mizoram' },
    { code: '18', name: 'Nagaland' },
    { code: '19', name: 'Odisha' },
    { code: '20', name: 'Punjab' },
    { code: '21', name: 'Rajasthan' },
    { code: '22', name: 'Sikkim' },
    { code: '23', name: 'Tamil Nadu' },
    { code: '24', name: 'Telangana' },
    { code: '25', name: 'Tripura' },
    { code: '26', name: 'Uttar Pradesh' },
    { code: '27', name: 'Uttarakhand' },
    { code: '28', name: 'West Bengal' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">GST Registration</h1>
        <p className="text-gray-600 mt-2">Register your business for GST</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Registration Number *</label>
            <Input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="E.g., 18AABCT1234H1Z0"
              required
              disabled={loading}
              pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[0-9A-Z]{1}"
              title="Enter a valid 15-character GST number"
            />
            <p className="text-xs text-gray-500 mt-1">Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + 1 alphanumeric</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date *</label>
              <Input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State Code *</label>
            <select
              name="stateCode"
              value={formData.stateCode}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a state</option>
              {stateCodes.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Document URL</label>
            <Input
              type="url"
              name="documentUrl"
              value={formData.documentUrl}
              onChange={handleChange}
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Registering...' : 'Register GST'}
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
