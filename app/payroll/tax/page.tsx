'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface EmployeeTax {
  id: string
  employee_id: string
  tax_type: string
  financial_year: string
  registration_number: string
  status: string
}

interface Employee {
  id: string
  employee_name: string
}

export default function EmployeeTaxPage() {
  const [taxes, setTaxes] = useState<EmployeeTax[]>([])
  const [employees, setEmployees] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data: empData } = await supabase
            .from('employees')
            .select('id, employee_name')
            .eq('company_id', company.id)

          const empMap: Record<string, string> = {}
          empData?.forEach((emp: Employee) => {
            empMap[emp.id] = emp.employee_name
          })
          setEmployees(empMap)

          const { data: taxData, error } = await supabase
            .from('employee_tax')
            .select('*')
            .in('employee_id', empData?.map((e: Employee) => e.id) || [])
            .order('financial_year', { ascending: false })

          if (error) throw error
          setTaxes(taxData || [])
        }
      } catch (error) {
        console.error('Error fetching employee taxes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const filteredTaxes = taxes.filter(
    (tax) =>
      (employees[tax.employee_id]?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      tax.tax_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Filed: 'bg-green-100 text-green-800',
    Paid: 'bg-blue-100 text-blue-800',
  }

  const taxTypeColors: Record<string, string> = {
    TDS: 'bg-red-50',
    PF: 'bg-blue-50',
    ESI: 'bg-green-50',
    PT: 'bg-purple-50',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Tax Records</h1>
          <p className="text-gray-600 mt-2">Manage TDS, PF, ESI, and PT</p>
        </div>
        <Link href="/payroll/tax/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            Add Tax Record
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by employee name or tax type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading tax records...</div>
        ) : filteredTaxes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No records found matching your search.' : 'No tax records yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tax Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Registration #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Financial Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTaxes.map((tax) => (
                  <tr key={tax.id} className={`border-b border-gray-200 hover:bg-gray-50 ${taxTypeColors[tax.tax_type]}`}>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {employees[tax.employee_id] || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{tax.tax_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tax.registration_number || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tax.financial_year}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[tax.status]}`}>
                        {tax.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
