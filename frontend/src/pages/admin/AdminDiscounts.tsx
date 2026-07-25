import React, { useState, useEffect } from 'react';
import { createDiscount, updateDiscount, deleteDiscount, getAdminDiscounts } from '../../api/discounts';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

interface Discount {
  id: number;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  scope: 'ALL_PRODUCTS' | 'SPECIFIC_CATEGORY' | 'SPECIFIC_PRODUCT';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const AdminDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Partial<Discount>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAdminDiscounts();
      setDiscounts((data as any) || []);
    } catch (error) {
      console.error('Error fetching discounts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (discount?: Discount) => {
    if (discount) {
      // format dates for input type="datetime-local" if necessary, here we assume it's string format matching YYYY-MM-DDThh:mm
      setCurrentDiscount(discount);
    } else {
      setCurrentDiscount({
        discountType: 'PERCENTAGE',
        scope: 'ALL_PRODUCTS',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDiscount({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentDiscount.id) {
        await updateDiscount(currentDiscount.id, currentDiscount as Discount);
      } else {
        await createDiscount(currentDiscount as Omit<Discount, 'id'>);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving discount', error);
    }
  };

  const handleDeleteClick = (discount: Discount) => {
    setCurrentDiscount(discount);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (currentDiscount.id) {
      try {
        await deleteDiscount(currentDiscount.id);
        fetchData();
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting discount', error);
      }
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title">Discounts Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Add Discount
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Scope</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">End Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-6 text-gray-500">No discounts found.</td>
              </tr>
            ) : discounts.map((discount) => (
              <tr key={discount.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 font-mono font-bold text-accent">{discount.code}</td>
                <td className="p-3 font-semibold text-gray-900 dark:text-white">{discount.name}</td>
                <td className="p-3">
                  <Badge status={discount.discountType.replace('_', ' ')} variant="info" />
                </td>
                <td className="p-3 font-medium">
                  {discount.discountType === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                </td>
                <td className="p-3 text-sm">{discount.scope.replace('_', ' ')}</td>
                <td className="p-3 text-sm">{new Date(discount.startDate).toLocaleDateString()}</td>
                <td className="p-3 text-sm">{new Date(discount.endDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <Badge status={discount.isActive ? 'Active' : 'Inactive'} variant={discount.isActive ? 'success' : 'default'} />
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(discount)}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentDiscount.id ? 'Edit Discount' : 'Add Discount'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Code</label>
              <input 
                required
                type="text" 
                className="input-field py-2 font-mono uppercase"
                value={currentDiscount.code || ''}
                onChange={e => setCurrentDiscount({...currentDiscount, code: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                required
                type="text" 
                className="input-field py-2"
                value={currentDiscount.name || ''}
                onChange={e => setCurrentDiscount({...currentDiscount, name: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select 
                className="input-field py-2"
                value={currentDiscount.discountType || 'PERCENTAGE'}
                onChange={e => setCurrentDiscount({...currentDiscount, discountType: e.target.value as any})}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Value</label>
              <input 
                required
                type="number" 
                min="0"
                step={currentDiscount.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                max={currentDiscount.discountType === 'PERCENTAGE' ? '100' : undefined}
                className="input-field py-2"
                value={currentDiscount.value || ''}
                onChange={e => setCurrentDiscount({...currentDiscount, value: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Scope</label>
            <select 
              className="input-field py-2"
              value={currentDiscount.scope || 'ALL_PRODUCTS'}
              onChange={e => setCurrentDiscount({...currentDiscount, scope: e.target.value as any})}
            >
              <option value="ALL_PRODUCTS">All Products</option>
              <option value="SPECIFIC_CATEGORY">Specific Category</option>
              <option value="SPECIFIC_PRODUCT">Specific Product</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input 
                required
                type="datetime-local" 
                className="input-field py-2 text-sm"
                value={currentDiscount.startDate ? new Date(currentDiscount.startDate).toISOString().slice(0, 16) : ''}
                onChange={e => setCurrentDiscount({...currentDiscount, startDate: new Date(e.target.value).toISOString()})}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input 
                required
                type="datetime-local" 
                className="input-field py-2 text-sm"
                value={currentDiscount.endDate ? new Date(currentDiscount.endDate).toISOString().slice(0, 16) : ''}
                onChange={e => setCurrentDiscount({...currentDiscount, endDate: new Date(e.target.value).toISOString()})}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isActiveDiscount"
              checked={currentDiscount.isActive || false}
              onChange={e => setCurrentDiscount({...currentDiscount, isActive: e.target.checked})}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="isActiveDiscount" className="text-sm font-medium">Active Discount</label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {currentDiscount.id ? 'Save Changes' : 'Add Discount'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Discount" size="sm">
        <div className="text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Are you sure you want to delete discount <span className="font-bold">{currentDiscount.code}</span>?
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleConfirmDelete} className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-all duration-200">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDiscounts;
