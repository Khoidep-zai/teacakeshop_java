import { useState } from 'react';
import { Search, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

const mockReservations = [
  { id: 1, code: 'RES-001', customer: 'Nguyen Van A', date: '2026-07-26', time: '14:00', partySize: 2, status: 'PENDING' },
  { id: 2, code: 'RES-002', customer: 'Tran Thi B', date: '2026-07-26', time: '15:30', partySize: 4, status: 'CONFIRMED' },
  { id: 3, code: 'RES-003', customer: 'Le Van C', date: '2026-07-27', time: '10:00', partySize: 2, status: 'COMPLETED' },
  { id: 4, code: 'RES-004', customer: 'Pham Thi D', date: '2026-07-28', time: '18:00', partySize: 6, status: 'CANCELLED' },
];

export default function AdminReservations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState(mockReservations);

  const updateStatus = (id: number, status: string) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filtered = reservations.filter(r => 
    r.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservations</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by code or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Party Size</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{res.code}</td>
                  <td className="px-6 py-4">{res.customer}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1"><CalendarIcon className="w-4 h-4 text-gray-400"/> {res.date}</div>
                    <div className="text-xs text-gray-500 mt-1 ml-5">{res.time}</div>
                  </td>
                  <td className="px-6 py-4">{res.partySize} guests</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {res.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateStatus(res.id, 'CONFIRMED')} className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40" title="Confirm">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus(res.id, 'CANCELLED')} className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/40" title="Cancel">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {res.status === 'CONFIRMED' && (
                      <button onClick={() => updateStatus(res.id, 'COMPLETED')} className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/40">
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
