"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Star,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  Check,
  ImageIcon,
} from "lucide-react";
import { api, Product } from "@/lib/api";

const categories = ["All", "iPhone", "MacBook", "iPad", "Watch", "Accessories"];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category: "iPhone",
    health_rating: 5,
    stock_count: "",
    image_url: "",
    is_featured: false,
    is_active: true,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "low-stock" || filter === "out-of-stock") {
      setSelectedCategory("All");
    }
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    const filter = searchParams.get("filter");
    if (filter === "low-stock") {
      return matchesSearch && matchesCategory && product.stock_count > 0 && product.stock_count < 5;
    }
    if (filter === "out-of-stock") {
      return matchesSearch && matchesCategory && product.stock_count === 0;
    }

    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    lowStock: products.filter((p) => p.stock_count > 0 && p.stock_count < 5).length,
    outOfStock: products.filter((p) => p.stock_count === 0).length,
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      original_price: "",
      category: "iPhone",
      health_rating: 5,
      stock_count: "",
      image_url: "",
      is_featured: false,
      is_active: true,
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category: product.category,
      health_rating: product.health_rating,
      stock_count: product.stock_count.toString(),
      image_url: product.image_url || "",
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        category: formData.category,
        health_rating: formData.health_rating,
        stock_count: parseInt(formData.stock_count) || 0,
        image_url: formData.image_url || undefined,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      await fetchProducts();
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      await fetchProducts();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  const getHealthLabel = (rating: number) => {
    const labels = ["", "Acceptable", "Fair", "Good", "Excellent", "Like New"];
    return labels[rating] || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Total Products</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Active</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Low Stock</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
            >
              {/* Product Image */}
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 relative flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={48} className="text-slate-300" />
                )}
                {product.is_featured && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-lg">
                    Featured
                  </span>
                )}
                {!product.is_active && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-slate-500 text-white text-xs font-semibold rounded-lg">
                    Inactive
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    <h3 className="font-semibold text-slate-900 mt-2">{product.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit size={16} className="text-slate-500" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-slate-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Condition */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < product.health_rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{getHealthLabel(product.health_rating)}</span>
                </div>

                {/* Price & Stock */}
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{product.price.toFixed(2)}</p>
                    {product.original_price && product.original_price > product.price && (
                      <p className="text-sm text-slate-400 line-through">
                        {product.original_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      product.stock_count === 0
                        ? "bg-red-50 text-red-700"
                        : product.stock_count < 5
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {product.stock_count === 0 ? "Out of stock" : `${product.stock_count} in stock`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No products found</p>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery ? "Try adjusting your search" : "Add your first product to get started"}
          </p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="iPhone 15 Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Product description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="999.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1199.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stock Count *</label>
                  <input
                    type="number"
                    value={formData.stock_count}
                    onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Condition (Health Rating)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, health_rating: rating })}
                      className="p-1"
                    >
                      <Star
                        size={24}
                        className={`${
                          rating <= formData.health_rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-slate-500">
                    {getHealthLabel(formData.health_rating)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Active</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.price}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {editingProduct ? "Update" : "Create"} Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Delete Product?</h3>
            <p className="text-slate-500 mt-2">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
