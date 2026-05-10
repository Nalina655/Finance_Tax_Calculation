'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface Employee {
  id: string
  employee_id: string
  employee_name: string
  email: string
  designation: string
  salary: number
  status: string
  date_of_joining: string
}

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('company_id', company.id)
            .order('date_of_joining', { ascending: false })

          if (error) throw error
          setEmployees(data || [])
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [supabase])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage employee records and information</p>
        </div>
        <Link href="/payroll/employees/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No employees found matching your search.' : 'No employees yet. Add your first employee.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Employee ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Salary</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{emp.employee_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{emp.employee_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.designation}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{emp.salary.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[emp.status]}`}>
                        {emp.status}
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
