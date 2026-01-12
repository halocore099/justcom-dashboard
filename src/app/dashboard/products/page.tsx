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
  RefreshCw,
  AlertCircle,
  Check,
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #27272a',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>Loading products...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#71717a', marginBottom: '4px', textTransform: 'uppercase' }}>
            Inventory
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fafafa', margin: 0 }}>Products</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchProducts}
            style={{
              padding: '10px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '10px',
              color: '#a1a1aa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowAddModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            color: '#ef4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Products', value: stats.total, color: '#fafafa' },
          { label: 'Active', value: stats.active, color: '#10b981' },
          { label: 'Low Stock', value: stats.lowStock, color: '#f59e0b' },
          { label: 'Out of Stock', value: stats.outOfStock, color: '#ef4444' },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: stat.color, fontFamily: '"JetBrains Mono", monospace', margin: '4px 0 0 0' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '44px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '10px',
              color: '#fafafa',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: selectedCategory === category ? '#3b82f6' : '#27272a',
                color: selectedCategory === category ? 'white' : '#a1a1aa',
                transition: 'all 0.2s ease',
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                backgroundColor: '#16181d',
                border: '1px solid #27272a',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {/* Product Image */}
              <div
                style={{
                  aspectRatio: '16/9',
                  backgroundColor: '#1c1e24',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package size={40} style={{ color: '#3f3f46' }} />
                )}
                {product.is_featured && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                    }}
                  >
                    Featured
                  </span>
                )}
                {!product.is_active && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#52525b',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                    }}
                  >
                    Inactive
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {product.category}
                    </span>
                    <h3 style={{ fontWeight: 600, color: '#fafafa', marginTop: '8px', fontSize: '14px' }}>{product.name}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => openEditModal(product)}
                      style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                    >
                      <Edit size={14} style={{ color: '#71717a' }} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                    >
                      <Trash2 size={14} style={{ color: '#71717a' }} />
                    </button>
                  </div>
                </div>

                {/* Condition */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        style={{ color: i < product.health_rating ? '#f59e0b' : '#3f3f46' }}
                        fill={i < product.health_rating ? '#f59e0b' : 'none'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#71717a' }}>{getHealthLabel(product.health_rating)}</span>
                </div>

                {/* Price & Stock */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '16px' }}>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#fafafa', fontFamily: '"JetBrains Mono", monospace', margin: 0 }}>
                      €{product.price.toFixed(2)}
                    </p>
                    {product.original_price && product.original_price > product.price && (
                      <p style={{ fontSize: '12px', color: '#52525b', textDecoration: 'line-through', fontFamily: '"JetBrains Mono", monospace', margin: '2px 0 0 0' }}>
                        €{product.original_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: product.stock_count === 0 ? 'rgba(239, 68, 68, 0.1)' : product.stock_count < 5 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: product.stock_count === 0 ? '#ef4444' : product.stock_count < 5 ? '#f59e0b' : '#10b981',
                    }}
                  >
                    {product.stock_count === 0 ? "Out of stock" : `${product.stock_count} in stock`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#16181d',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <Package size={32} style={{ color: '#3f3f46', marginBottom: '16px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#71717a', margin: 0 }}>No products found</p>
          <p style={{ fontSize: '13px', color: '#52525b', marginTop: '4px' }}>
            {searchQuery ? "Try adjusting your search" : "Add your first product to get started"}
          </p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#16181d',
                padding: '20px 24px',
                borderBottom: '1px solid #27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fafafa', margin: 0 }}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
              >
                <X size={18} style={{ color: '#71717a' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="iPhone 15 Pro"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#0f1117',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#0f1117',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="999.00"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#0f1117',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fafafa',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="1199.00"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#0f1117',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fafafa',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#0f1117',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fafafa',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Stock Count *</label>
                  <input
                    type="number"
                    value={formData.stock_count}
                    onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })}
                    placeholder="10"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#0f1117',
                      border: '1px solid #27272a',
                      borderRadius: '10px',
                      color: '#fafafa',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Condition</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#0f1117', borderRadius: '10px', border: '1px solid #27272a' }}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, health_rating: rating })}
                      style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >
                      <Star
                        size={20}
                        style={{ color: rating <= formData.health_rating ? '#f59e0b' : '#3f3f46', transition: 'color 0.2s' }}
                        fill={rating <= formData.health_rating ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                  <span style={{ marginLeft: '12px', fontSize: '13px', color: '#71717a' }}>{getHealthLabel(formData.health_rating)}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#0f1117',
                    border: '1px solid #27272a',
                    borderRadius: '10px',
                    color: '#fafafa',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px', backgroundColor: '#0f1117', borderRadius: '10px', border: '1px solid #27272a' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Featured</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Active</span>
                </label>
              </div>
            </div>

            <div
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#16181d',
                padding: '16px 24px',
                borderTop: '1px solid #27272a',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#27272a',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#a1a1aa',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.price}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: isSaving || !formData.name || !formData.price ? 'not-allowed' : 'pointer',
                  opacity: isSaving || !formData.name || !formData.price ? 0.5 : 1,
                }}
              >
                {isSaving ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    {editingProduct ? "Update" : "Create"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#16181d',
              border: '1px solid #27272a',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '384px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Trash2 size={22} style={{ color: '#ef4444' }} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa', margin: 0 }}>Delete Product?</h3>
            <p style={{ fontSize: '13px', color: '#71717a', marginTop: '8px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#27272a',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#a1a1aa',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
