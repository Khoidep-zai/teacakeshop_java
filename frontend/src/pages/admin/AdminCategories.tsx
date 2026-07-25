import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount?: number;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCategories().catch(() => []);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setCurrentCategory(category);
    } else {
      setCurrentCategory({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentCategory.id) {
        await updateCategory(currentCategory.id, currentCategory as Category);
      } else {
        await createCategory(currentCategory as Omit<Category, 'id'>);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category', error);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (currentCategory.id) {
      try {
        await deleteCategory(currentCategory.id);
        fetchData();
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting category', error);
      }
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title">Categories Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Add Category
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-center">Products</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">No categories found.</td>
              </tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3 text-gray-500">#{cat.id}</td>
                <td className="p-3 font-semibold text-gray-900 dark:text-white">{cat.name}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400 truncate max-w-xs">{cat.description}</td>
                <td className="p-3 text-center">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                    {cat.productCount || 0}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleOpenModal(cat)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(cat)}
                      className="text-red-500 hover:text-red-700 transition-colors"
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentCategory.id ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              required
              type="text" 
              className="input-field py-2"
              value={currentCategory.name || ''}
              onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              className="input-field py-2 h-24 resize-none"
              value={currentCategory.description || ''}
              onChange={e => setCurrentCategory({...currentCategory, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {currentCategory.id ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Category" size="sm">
        <div className="text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <span className="font-bold">{currentCategory.name}</span>? 
            This will fail if there are products attached to this category.
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

export default AdminCategories;
