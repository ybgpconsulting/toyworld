import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminGetProducts, adminDeleteProduct } from '../../lib/api';
import { Button } from '../../components/ui/Button';

import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const Products = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminProducts', page, search],
    queryFn: () => adminGetProducts({ page, search }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--deep-navy)]">Products</h1>
        <Link to="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-orange)] focus:border-transparent text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No products found.</td></tr>
              ) : (
                data?.data.map((product: any) => {
                  const stock = product.stock ?? product.stock_quantity ?? 0;
                  const price = product.price ?? product.selling_price ?? 0;
                  const img = product.images?.[0]?.url || product.images?.[0]?.image_url || '';
                  const idStr = product.sku || String(product.id).substring(0, 8);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">Toy</div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category_name || product.categoryId || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{idStr}</td>
                      <td className="p-4 font-medium">₹{price.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`font-medium ${stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={product.is_active ? 'green' : 'gray'}>
                          {product.is_active ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${product.id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={async () => {
                              if (window.confirm('Delete this product?')) {
                                await adminDeleteProduct(product.id);
                                window.location.reload();
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })

              )}
            </tbody>
          </table>
        </div>

        {/* Basic Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing page {data?.page || 1} of {data?.totalPages || 1}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === (data?.totalPages || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
