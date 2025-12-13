"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ProductCard } from "@/components/productcard";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import api from "@/libs/api";
import { Product, Category } from "@/types";

// --- ICON COMPONENT (Biar Search Bar Ganteng) ---
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export default function ShopPage() {
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        const productsData = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data?.data || [];
        setProducts(productsData);

        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data?.data || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Gagal ambil data shop:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. FILTERING LOGIC (MESIN PEMROSES) ---
  const processedProducts = useMemo(() => {
    let result = [...products];

    // A. Logic Search (Case Insensitive)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery)
      );
    }

    // B. Logic Category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }

    // C. Logic Sorting
    switch (sortOption) {
      case "price_low":
        result.sort((a, b) => a.price - b.price); // Murah ke Mahal
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price); // Mahal ke Murah
        break;
      case "name_az":
        result.sort((a, b) => a.name.localeCompare(b.name)); // Abjad A-Z
        break;
      case "newest":
      default:
        result.sort((a, b) => b.id - a.id); // ID Gede = Baru
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortOption]);

  // --- HELPER BUAT SKELETON ---
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="rounded-lg bg-default-300 h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="w-3/5 rounded-lg h-3 bg-default-200" />
            <Skeleton className="w-4/5 rounded-lg h-3 bg-default-200" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jelajahi Produk</h1>
          <p className="text-default-500">Temukan barang impianmu di sini.</p>
        </div>
        
        <div className="text-default-400 text-sm">
            Total: <span className="text-primary font-bold">{processedProducts.length}</span> Produk ditemukan
        </div>
      </div>

      {/* FILTER BAR (Sticky biar enak scrollnya) */}
      <div className="sticky top-16 z-20 mb-8 rounded-xl border border-default-200 bg-background/80 p-4 shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          
          {/* 1. SEARCH BAR */}
          <div className="md:col-span-6">
            <Input
              isClearable
              placeholder="Cari laptop, baju, ..."
              startContent={<SearchIcon className="text-default-400" />}
              value={searchQuery}
              onValueChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
          </div>

          {/* 2. CATEGORY DROPDOWN */}
          <div className="md:col-span-3">
            <Select
              placeholder="Kategori"
              selectedKeys={[selectedCategory]}
              onChange={(e) => setSelectedCategory(e.target.value)}
              items={[
                { id: 99999, name: "Semua Kategori", slug: "all" },
                ...categories,
              ]}
            >
              {(item) => (
                <SelectItem key={item.slug} textValue={item.name}>
                  {item.name}
                </SelectItem>
              )}
            </Select>
          </div>

          {/* 3. SORT DROPDOWN */}
          <div className="md:col-span-3">
            <Select
              placeholder="Urutkan"
              selectedKeys={[sortOption]}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <SelectItem key="newest">Terbaru</SelectItem>
              <SelectItem key="price_low">Termurah</SelectItem>
              <SelectItem key="price_high">Termahal</SelectItem>
              <SelectItem key="name_az">Nama (A-Z)</SelectItem>
            </Select>
          </div>

        </div>
      </div>

      {/* PRODUCT GRID SECTION */}
      {loading ? (
        renderSkeletons()
      ) : processedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-xl font-bold">Produk tidak ditemukan</h3>
            <p className="text-default-500 mb-6">Coba ganti kata kunci atau reset filter lo, King.</p>
            <Button 
                color="primary" 
                variant="flat"
                onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSortOption("newest");
                }}
            >
                Reset Filter
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}