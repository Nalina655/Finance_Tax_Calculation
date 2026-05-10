'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface PurchaseEntry {
  id: string
  bill_number: string
  bill_date: string
  vendor_name: string
  total_amount: number
  payment_status: string
}

export default function PurchasesListPage() {
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data: company } = await supabase
          .from('company_settings')
          .select('id')
          .limit(1)
          .single()

        if (company) {
          const { data, error } = await supabase
            .from('purchase_entries')
            .select('*')
            .eq('company_id', company.id)
            .order('bill_date', { ascending: false })

          if (error) throw error
          setPurchases(data || [])
        }
      } catch (error) {
        console.error('Error fetching purchases:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [supabase])

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    Unpaid: 'bg-red-100 text-red-800',
    Partial: 'bg-yellow-100 text-yellow-800',
    Paid: 'bg-green-100 text-green-800',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Entries</h1>
          <p className="text-gray-600 mt-2">Manage all purchase bills</p>
        </div>
        <Link href="/accounting/purchases/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus size={20} />
            New Purchase Bill
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by bill number or vendor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading purchase entries...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No purchase entries found matching your search.' : 'No purchase entries yet. Create your first bill.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bill #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{purchase.bill_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(purchase.bill_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{purchase.vendor_name}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                      ₹{purchase.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[purchase.payment_status]}`}>
                        {purchase.payment_status}
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
