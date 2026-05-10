'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface GSTFiling {
  id: string
  gst_return_type: string
  financial_year: string
  filing_date: string
  total_tax_amount: number
  status: string
  return_period: string
}

export default function GSTFilingsPage() {
  const [filings, setFilings] = useState<GSTFiling[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchFilings = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data: registrations } = await supabase
            .from('gst_registration')
            .select('id')
            .eq('company_id', company.id)

          if (registrations && registrations.length > 0) {
            const regIds = registrations.map((r) => r.id)
            const { data, error } = await supabase
              .from('gst_filings')
              .select('*')
              .in('gst_registration_id', regIds)
              .order('filing_date', { ascending: false })

            if (error) throw error
            setFilings(data || [])
          }
        }
      } catch (error) {
        console.error('Error fetching GST filings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilings()
  }, [supabase])

  const filteredFilings = filings.filter(
    (filing) =>
      filing.gst_return_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filing.financial_year.includes(searchTerm)
  )

  const statusColors: Record<string, string> = {
    Filed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GST Filings</h1>
          <p className="text-gray-600 mt-2">Manage GST returns and filings</p>
        </div>
        <Link href="/gst/filings/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            File GST Return
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by return type or financial year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading GST filings...</div>
        ) : filteredFilings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No filings found matching your search.' : 'No GST filings yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Return Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Financial Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Filing Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Tax Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFilings.map((filing) => (
                  <tr key={filing.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{filing.gst_return_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{filing.financial_year}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{filing.return_period}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(filing.filing_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{filing.total_tax_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[filing.status]}`}>
                        {filing.status}
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
