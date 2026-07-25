import React, { useState, useEffect } from 'react';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  getProducts 
} from '../../api/products';
import { getCategories } from '../../api/categories';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  productType: 'TEA' | 'CAKE';
  categoryId: number;
  stockQuantity: number;
  taste?: string;
  temperatureType?: string;
  season?: string;
  isActive: boolean;
  category?: Category;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock API call or real if implemented
      const [productsData, categoriesData] = await Promise.all([
        getProducts().catch(() => []),
        getCategories().catch(() => [])
      ]);
      setProducts((productsData as any).content ?? productsData ?? []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setPreviewUrl(product.imageUrl || '');
    } else {
      setCurrentProduct({
        productType: 'TEA',
        isActive: true,
        stockQuantity: 0,
        price: 0
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({});
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = currentProduct.imageUrl;
      
      if (selectedFile) {
        setImageUploading(true);
        // We'd need an actual ID if this was an existing product, or we upload first and get URL.
        const uploadRes = await uploadProductImage(currentProduct.id || 0, selectedFile);
        finalImageUrl = uploadRes.imageUrl; // assuming response structure
        setImageUploading(false);
      }

      const productData = {
        ...currentProduct,
        imageUrl: finalImageUrl,
      };

      if (currentProduct.id) {
        await updateProduct(currentProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product', error);
      setImageUploading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (currentProduct.id) {
      try {
        await deleteProduct(currentProduct.id);
        fetchData();
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting product', error);
      }
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title">Products Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Add Product
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500">No products found.</td>
              </tr>
            ) : products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No img</div>
                    )}
                  </div>
                </td>
                <td className="p-3 font-semibold text-gray-900 dark:text-white">{product.name}</td>
                <td className="p-3">
                  <Badge status={product.productType} variant={product.productType === 'TEA' ? 'info' : 'warning'} />
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-400">
                  {categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                </td>
                <td className="p-3 font-medium text-primary">${product.price.toFixed(2)}</td>
                <td className="p-3">{product.stockQuantity}</td>
                <td className="p-3">
                  <Badge status={product.isActive ? 'Active' : 'Inactive'} variant={product.isActive ? 'success' : 'default'} />
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(product)}
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
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentProduct.id ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                required
                type="text" 
                className="input-field py-2"
                value={currentProduct.name || ''}
                onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select 
                className="input-field py-2"
                value={currentProduct.productType || 'TEA'}
                onChange={e => setCurrentProduct({...currentProduct, productType: e.target.value as 'TEA'|'CAKE'})}
              >
                <option value="TEA">Tea</option>
                <option value="CAKE">Cake</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              className="input-field py-2 h-20 resize-none"
              value={currentProduct.description || ''}
              onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                required
                className="input-field py-2"
                value={currentProduct.categoryId || ''}
                onChange={e => setCurrentProduct({...currentProduct, categoryId: Number(e.target.value)})}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Price</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                className="input-field py-2"
                value={currentProduct.price || ''}
                onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input 
                required
                type="number" 
                min="0"
                className="input-field py-2"
                value={currentProduct.stockQuantity || 0}
                onChange={e => setCurrentProduct({...currentProduct, stockQuantity: Number(e.target.value)})}
              />
            </div>
          </div>

          {currentProduct.productType === 'TEA' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Taste</label>
                <input 
                  type="text" 
                  className="input-field py-2"
                  value={currentProduct.taste || ''}
                  onChange={e => setCurrentProduct({...currentProduct, taste: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Temperature</label>
                <select 
                  className="input-field py-2"
                  value={currentProduct.temperatureType || ''}
                  onChange={e => setCurrentProduct({...currentProduct, temperatureType: e.target.value})}
                >
                  <option value="">Any</option>
                  <option value="HOT">Hot</option>
                  <option value="COLD">Cold</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Season</label>
                <input 
                  type="text" 
                  className="input-field py-2"
                  value={currentProduct.season || ''}
                  onChange={e => setCurrentProduct({...currentProduct, season: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isActive"
              checked={currentProduct.isActive || false}
              onChange={e => setCurrentProduct({...currentProduct, isActive: e.target.checked})}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium">Active Product</label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={imageUploading} className="btn-primary flex items-center gap-2">
              {imageUploading ? <Spinner size="sm" color="text-white" /> : null}
              {currentProduct.id ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Product" size="sm">
        <div className="text-center">
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <span className="font-bold">{currentProduct.name}</span>? This action cannot be undone.
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

export default AdminProducts;
