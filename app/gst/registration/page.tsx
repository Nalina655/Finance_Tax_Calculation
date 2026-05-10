'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface GSTRegistration {
  id: string
  gst_registration_number: string
  registration_date: string
  registration_status: string
  financial_year: string
  state_code: string
}

export default function GSTRegistrationListPage() {
  const [registrations, setRegistrations] = useState<GSTRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data, error } = await supabase
            .from('gst_registration')
            .select('*')
            .eq('company_id', company.id)
            .order('registration_date', { ascending: false })

          if (error) throw error
          setRegistrations(data || [])
        }
      } catch (error) {
        console.error('Error fetching GST registrations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [supabase])

  const statusColors: Record<string, string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-red-100 text-red-800',
    Suspended: 'bg-yellow-100 text-yellow-800',
  }

  const stateCodes: Record<string, string> = {
    '01': 'Andhra Pradesh', '02': 'Arunachal Pradesh', '03': 'Assam', '04': 'Bihar',
    '05': 'Chhattisgarh', '06': 'Goa', '07': 'Gujarat', '08': 'Haryana', '09': 'Himachal Pradesh',
    '10': 'Jharkhand', '11': 'Karnataka', '12': 'Kerala', '13': 'Madhya Pradesh',
    '14': 'Maharashtra', '15': 'Manipur', '16': 'Meghalaya', '17': 'Mizoram',
    '18': 'Nagaland', '19': 'Odisha', '20': 'Punjab', '21': 'Rajasthan', '22': 'Sikkim',
    '23': 'Tamil Nadu', '24': 'Telangana', '25': 'Tripura', '26': 'Uttar Pradesh',
    '27': 'Uttarakhand', '28': 'West Bengal',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GST Registrations</h1>
          <p className="text-gray-600 mt-2">Manage your GST registrations</p>
        </div>
        <Link href="/gst/registration/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            New Registration
          </Button>
        </Link>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading GST registrations...</div>
        ) : registrations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No GST registrations yet. Register your business for GST.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">GST Number</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">State</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Registration Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Financial Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{reg.gst_registration_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {stateCodes[reg.state_code] || reg.state_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(reg.registration_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reg.financial_year}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[reg.registration_status]}`}>
                        {reg.registration_status}
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
