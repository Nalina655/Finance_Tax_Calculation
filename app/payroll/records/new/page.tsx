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
  salary: number
}

export default function NewPayrollRecordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    employeeId: '',
    payrollMonth: new Date().toISOString().split('T')[0],
    grossSalary: '',
    basicSalary: '',
    dearness: '',
    houseRent: '',
    epf: '',
    esi: '',
    incomeTax: '',
    otherDeductions: '',
    netSalary: '',
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
            .select('id, employee_name, salary')
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value,
    }

    // Auto-calculate net salary if amounts change
    if (['basicSalary', 'dearness', 'houseRent', 'epf', 'esi', 'incomeTax', 'otherDeductions'].includes(name)) {
      const basic = parseFloat(newFormData.basicSalary) || 0
      const da = parseFloat(newFormData.dearness) || 0
      const hra = parseFloat(newFormData.houseRent) || 0
      const gross = basic + da + hra
      const deductions =
        (parseFloat(newFormData.epf) || 0) +
        (parseFloat(newFormData.esi) || 0) +
        (parseFloat(newFormData.incomeTax) || 0) +
        (parseFloat(newFormData.otherDeductions) || 0)

      newFormData.grossSalary = gross.toFixed(2)
      newFormData.netSalary = (gross - deductions).toFixed(2)
    }

    // Set gross salary based on employee selection
    if (name === 'employeeId') {
      const selected = employees.find((e) => e.id === value)
      if (selected) {
        newFormData.basicSalary = selected.salary.toString()
        newFormData.grossSalary = selected.salary.toFixed(2)
      }
    }

    setFormData(newFormData)
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

      const { error: insertError } = await supabase.from('payroll_records').insert({
        employee_id: formData.employeeId,
        payroll_month: formData.payrollMonth,
        gross_salary: parseFloat(formData.grossSalary),
        net_salary: parseFloat(formData.netSalary),
        status: 'Processed',
      })

      if (insertError) {
        throw insertError
      }

      router.push('/payroll/records')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to process payroll')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Process Payroll</h1>
        <p className="text-gray-600 mt-2">Calculate and process employee salary</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Payroll Month *</label>
              <Input
                type="date"
                name="payrollMonth"
                value={formData.payrollMonth}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Salary Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary *</label>
                <Input
                  type="number"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dearness Allowance</label>
                <Input
                  type="number"
                  name="dearness"
                  value={formData.dearness}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">House Rent Allowance</label>
                <Input
                  type="number"
                  name="houseRent"
                  value={formData.houseRent}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Deductions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">EPF (Employee)</label>
                <Input
                  type="number"
                  name="epf"
                  value={formData.epf}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ESI</label>
                <Input
                  type="number"
                  name="esi"
                  value={formData.esi}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Income Tax</label>
                <Input
                  type="number"
                  name="incomeTax"
                  value={formData.incomeTax}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Other Deductions</label>
                <Input
                  type="number"
                  name="otherDeductions"
                  value={formData.otherDeductions}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Gross Salary</p>
              <p className="text-2xl font-bold text-blue-900">₹{parseFloat(formData.grossSalary || 0).toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Net Salary</p>
              <p className="text-2xl font-bold text-green-900">₹{parseFloat(formData.netSalary || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Processing...' : 'Process Payroll'}
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
