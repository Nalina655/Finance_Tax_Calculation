'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Employee {
  id: string
  employee_name: string
}

export default function NewEmployeeTaxPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    employeeId: '',
    taxType: 'TDS',
    financialYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    registrationNumber: '',
    certificateNumber: '',
    taxAmount: '',
    description: '',
  })

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data } = await supabase
            .from('employees')
            .select('id, employee_name')
            .eq('company_id', company.id)
            .eq('status', 'Active')

          setEmployees(data || [])
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }

    fetchEmployees()
  }, [supabase])

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

      const { error: insertError } = await supabase.from('employee_tax').insert({
        employee_id: formData.employeeId,
        tax_type: formData.taxType,
        financial_year: formData.financialYear,
        registration_number: formData.registrationNumber || null,
        certificate_number: formData.certificateNumber || null,
        tax_amount: parseFloat(formData.taxAmount) || 0,
        description: formData.description || null,
        status: 'Pending',
      })

      if (insertError) {
        throw insertError
      }

      router.push('/payroll/tax')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to add tax record')
      setLoading(false)
    }
  }

  const taxTypes = ['TDS', 'PF', 'ESI', 'PT']
  const taxTypeDescriptions: Record<string, string> = {
    TDS: 'Tax Deducted at Source',
    PF: 'Provident Fund Contribution',
    ESI: 'Employee State Insurance',
    PT: 'Professional Tax',
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Employee Tax Record</h1>
        <p className="text-gray-600 mt-2">Register tax deductions and contributions for employees</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Type *</label>
              <select
                name="taxType"
                value={formData.taxType}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {taxTypes.map((type) => (
                  <option key={type} value={type}>
                    {type} - {taxTypeDescriptions[type]}
                  </option>
                ))}
              </select>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Amount</label>
              <Input
                type="number"
                name="taxAmount"
                value={formData.taxAmount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.taxType === 'TDS' ? 'TAN Number' : 'Registration Number'}
              </label>
              <Input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder={formData.taxType === 'TDS' ? 'Tax Account Number' : 'Registration number'}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate/Reference Number</label>
              <Input
                type="text"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleChange}
                placeholder="Certificate or reference number"
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
              placeholder="Add any notes or details about this tax record..."
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
              {loading ? 'Adding...' : 'Add Tax Record'}
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
