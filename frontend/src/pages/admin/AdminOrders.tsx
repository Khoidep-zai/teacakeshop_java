import { useState } from 'react';
import { Search, Filter, Eye, Edit } from 'lucide-react';

const mockOrders = [
  { id: 1, orderCode: 'ORD-001', customer: 'Nguyen Van A', items: 3, total: 450000, status: 'PENDING', date: '2026-07-25T10:30:00Z' },
  { id: 2, orderCode: 'ORD-002', customer: 'Tran Thi B', items: 1, total: 120000, status: 'CONFIRMED', date: '2026-07-25T09:15:00Z' },
  { id: 3, orderCode: 'ORD-003', customer: 'Le Van C', items: 5, total: 850000, status: 'PREPARING', date: '2026-07-24T18:45:00Z' },
  { id: 4, orderCode: 'ORD-004', customer: 'Pham Thi D', items: 2, total: 240000, status: 'COMPLETED', date: '2026-07-24T14:20:00Z' },
  { id: 5, orderCode: 'ORD-005', customer: 'Hoang Van E', items: 1, total: 65000, status: 'CANCELLED', date: '2026-07-23T11:10:00Z' },
];

const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'];

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PREPARING': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = mockOrders.filter(o => 
    (statusFilter === 'ALL' || o.status === statusFilter) &&
    (o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm appearance-none cursor-pointer"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">Order Code</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.orderCode}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4">{order.items} items</td>
                  <td className="px-6 py-4 font-medium">{order.total.toLocaleString('vi-VN')} ₫</td>
                  <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                          title="Update Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {openDropdown === order.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-20">
                            {['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'].map(s => (
                              <button
                                key={s}
                                onClick={() => {
                                  // Update logic here
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 ${order.status === s ? 'text-amber-600 font-medium bg-amber-50 dark:bg-amber-900/10' : 'text-gray-700 dark:text-gray-300'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
