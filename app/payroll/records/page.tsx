'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface PayrollRecord {
  id: string
  employee_id: string
  payroll_month: string
  gross_salary: number
  net_salary: number
  status: string
}

interface Employee {
  id: string
  employee_name: string
}

export default function PayrollRecordsPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([])
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
          // Fetch employees
          const { data: empData } = await supabase
            .from('employees')
            .select('id, employee_name')
            .eq('company_id', company.id)

          const empMap: Record<string, string> = {}
          empData?.forEach((emp: Employee) => {
            empMap[emp.id] = emp.employee_name
          })
          setEmployees(empMap)

          // Fetch payroll records
          const { data: recordData, error } = await supabase
            .from('payroll_records')
            .select('*')
            .in('employee_id', empData?.map((e: Employee) => e.id) || [])
            .order('payroll_month', { ascending: false })

          if (error) throw error
          setRecords(recordData || [])
        }
      } catch (error) {
        console.error('Error fetching payroll records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const filteredRecords = records.filter(
    (record) =>
      (employees[record.employee_id]?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      record.payroll_month.includes(searchTerm)
  )

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Processed: 'bg-blue-100 text-blue-800',
    Paid: 'bg-green-100 text-green-800',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Records</h1>
          <p className="text-gray-600 mt-2">Manage employee payroll and salary processing</p>
        </div>
        <Link href="/payroll/records/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            Process Payroll
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by employee name or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading payroll records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No records found matching your search.' : 'No payroll records yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Gross Salary</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Deductions</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Net Salary</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {employees[record.employee_id] || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.payroll_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{record.gross_salary.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{(record.gross_salary - record.net_salary).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{record.net_salary.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[record.status]}`}>
                        {record.status}
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
