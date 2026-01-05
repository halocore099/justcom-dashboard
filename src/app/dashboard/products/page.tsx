"use client";

import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash2, MoreVertical } from "lucide-react";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

// Mock products data
const mockProducts = [
  { id: "1", name: "iPhone 14 Pro", category: "iphone", price: 899, stock: 15, healthRating: 5, isActive: true },
  { id: "2", name: "iPhone 13", category: "iphone", price: 649, stock: 23, healthRating: 4, isActive: true },
  { id: "3", name: "MacBook Air M2", category: "macbook", price: 1199, stock: 8, healthRating: 5, isActive: true },
  { id: "4", name: "iPad Pro 12.9", category: "ipad", price: 1099, stock: 5, healthRating: 4, isActive: true },
  { id: "5", name: "Apple Watch Series 9", category: "watch", price: 399, stock: 0, healthRating: 5, isActive: false },
  { id: "6", name: "AirPods Pro 2", category: "accessories", price: 249, stock: 42, healthRating: 5, isActive: true },
  { id: "7", name: "iPhone 12", category: "iphone", price: 499, stock: 3, healthRating: 3, isActive: true },
  { id: "8", name: "MacBook Pro 14", category: "macbook", price: 1999, stock: 12, healthRating: 5, isActive: true },
];

const categories = ["All", "iphone", "macbook", "ipad", "watch", "accessories"];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: "name",
      header: "Product",
      render: (product: typeof mockProducts[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500">
            {product.category.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">{product.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product: typeof mockProducts[0]) => (
        <span className="font-medium">€{product.price.toFixed(2)}</span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: typeof mockProducts[0]) => (
        <span className={product.stock <= 5 ? "text-red-600 font-medium" : ""}>
          {product.stock} units
        </span>
      ),
    },
    {
      key: "healthRating",
      header: "Condition",
      render: (product: typeof mockProducts[0]) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < product.healthRating ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (product: typeof mockProducts[0]) => (
        <StatusBadge status={product.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (product: typeof mockProducts[0]) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit size={16} className="text-gray-500" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Trash2 size={16} className="text-gray-500" />
          </button>
        </div>
      ),
      className: "w-20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category === "All" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-semibold mt-1">{mockProducts.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-semibold mt-1 text-green-600">
            {mockProducts.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-semibold mt-1 text-orange-600">
            {mockProducts.filter((p) => p.stock <= 5 && p.stock > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-semibold mt-1 text-red-600">
            {mockProducts.filter((p) => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyExtractor={(product) => product.id}
        onRowClick={(product) => console.log("Clicked:", product)}
        emptyMessage="No products found"
      />

      {/* Add Product Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
            <p className="text-gray-500 mb-4">Product form would go here...</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
