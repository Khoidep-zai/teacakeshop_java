import React, { useState, useEffect } from 'react';
import { createCombo, updateCombo, deleteCombo, getCombos } from '../../api/combos';
import { getProducts } from '../../api/products';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ComboItem {
  productId: number;
  quantity: number;
  product?: Product;
}

interface Combo {
  id: number;
  name: string;
  description: string;
  weatherType: string;
  comboPrice: number;
  originalPrice: number;
  savings: number;
  isActive: boolean;
  imageUrl?: string;
  items: ComboItem[];
}

const AdminCombos: React.FC = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCombo, setCurrentCombo] = useState<Partial<Combo>>({ items: [] });
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [combosData, productsData] = await Promise.all([
        getCombos().catch(() => []),
        getProducts().catch(() => [])
      ]);
      setCombos((combosData as any).content ?? combosData ?? []);
      setProducts((productsData as any).content ?? productsData ?? []);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (combo?: Combo) => {
    if (combo) {
      setCurrentCombo(JSON.parse(JSON.stringify(combo))); // deep copy
    } else {
      setCurrentCombo({
        weatherType: 'ANY',
        isActive: true,
        comboPrice: 0,
        items: []
      });
    }
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCombo({ items: [] });
  };

  const calculateOriginalPrice = (items: ComboItem[]) => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleAddItem = (product: Product) => {
    const items = currentCombo.items || [];
    const existingItem = items.find(i => i.productId === product.id);
    
    let newItems;
    if (existingItem) {
      newItems = items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      newItems = [...items, { productId: product.id, quantity: 1 }];
    }
    
    const originalPrice = calculateOriginalPrice(newItems);
    setCurrentCombo({
      ...currentCombo,
      items: newItems,
      originalPrice,
    });
    setProductSearch('');
  };

  const handleRemoveItem = (productId: number) => {
    const items = currentCombo.items || [];
    const newItems = items.filter(i => i.productId !== productId);
    const originalPrice = calculateOriginalPrice(newItems);
    setCurrentCombo({
      ...currentCombo,
      items: newItems,
      originalPrice,
    });
  };

  const handleItemQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    const items = currentCombo.items || [];
    const newItems = items.map(i => i.productId === productId ? { ...i, quantity } : i);
    const originalPrice = calculateOriginalPrice(newItems);
    setCurrentCombo({
      ...currentCombo,
      items: newItems,
      originalPrice,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const original = currentCombo.originalPrice || 0;
      const price = currentCombo.comboPrice || 0;
      const savings = original - price;
      
      const payload = {
        ...currentCombo,
        savings: savings > 0 ? savings : 0
      };

      if (currentCombo.id) {
        await updateCombo(currentCombo.id, payload);
      } else {
        await createCombo(payload);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving combo', error);
    }
  };

  const handleDeleteClick = (combo: Combo) => {
    setCurrentCombo(combo);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (currentCombo.id) {
      try {
        await deleteCombo(currentCombo.id);
        fetchData();
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting combo', error);
      }
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  if (loading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title">Combos Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Add Combo
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Weather</th>
              <th className="p-3">Price</th>
              <th className="p-3">Original</th>
              <th className="p-3">Savings</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {combos.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">No combos found.</td>
              </tr>
            ) : combos.map((combo) => (
              <tr key={combo.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {combo.imageUrl ? (
                      <img src={combo.imageUrl} alt={combo.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No img</div>
                    )}
                  </div>
                </td>
                <td className="p-3 font-semibold text-gray-900 dark:text-white">{combo.name}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{combo.weatherType}</td>
                <td className="p-3 font-bold text-primary">${combo.comboPrice.toFixed(2)}</td>
                <td className="p-3 text-gray-500 line-through">${combo.originalPrice.toFixed(2)}</td>
                <td className="p-3 text-green-500 font-medium">${combo.savings.toFixed(2)}</td>
                <td className="p-3">
                  <Badge status={combo.isActive ? 'Active' : 'Inactive'} variant={combo.isActive ? 'success' : 'default'} />
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(combo)}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(combo)}
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentCombo.id ? 'Edit Combo' : 'Add Combo'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                required
                type="text" 
                className="input-field py-2"
                value={currentCombo.name || ''}
                onChange={e => setCurrentCombo({...currentCombo, name: e.target.value})}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Weather Type</label>
              <select 
                className="input-field py-2"
                value={currentCombo.weatherType || 'ANY'}
                onChange={e => setCurrentCombo({...currentCombo, weatherType: e.target.value})}
              >
                <option value="ANY">Any</option>
                <option value="HOT">Hot</option>
                <option value="COLD">Cold</option>
                <option value="RAINY">Rainy</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              className="input-field py-2 h-16 resize-none"
              value={currentCombo.description || ''}
              onChange={e => setCurrentCombo({...currentCombo, description: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Combo Price</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                className="input-field py-2"
                value={currentCombo.comboPrice || ''}
                onChange={e => setCurrentCombo({...currentCombo, comboPrice: Number(e.target.value)})}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Original Price (Auto)</label>
              <input 
                type="number" 
                readOnly
                className="input-field py-2 bg-gray-50 dark:bg-gray-700/50"
                value={currentCombo.originalPrice || 0}
              />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mt-4">
            <label className="block text-sm font-bold mb-2">Combo Items</label>
            
            {/* Items List */}
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {(currentCombo.items || []).length === 0 ? (
                <p className="text-sm text-gray-500 italic">No items added yet.</p>
              ) : (
                (currentCombo.items || []).map((item, idx) => {
                  const p = products.find(prod => prod.id === item.productId);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                      <div className="flex-1 font-medium">{p?.name || 'Unknown'}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">${p?.price.toFixed(2)}</span>
                        <input 
                          type="number" 
                          min="1" 
                          className="w-16 input-field py-1 px-2 text-center"
                          value={item.quantity}
                          onChange={e => handleItemQuantityChange(item.productId, Number(e.target.value))}
                        />
                        <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 ml-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Product Search & Add */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search to add product..."
                className="input-field py-2 text-sm"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
              {productSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                        onClick={() => handleAddItem(p)}
                      >
                        <span>{p.name}</span>
                        <span className="text-sm font-medium text-primary">+ Add</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isActiveCombo"
              checked={currentCombo.isActive || false}
              onChange={e => setCurrentCombo({...currentCombo, isActive: e.target.checked})}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="isActiveCombo" className="text-sm font-medium">Active Combo</label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {currentCombo.id ? 'Save Changes' : 'Add Combo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Combo" size="sm">
        <div className="text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <span className="font-bold">{currentCombo.name}</span>?
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

export default AdminCombos;
