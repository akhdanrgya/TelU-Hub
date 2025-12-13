// frontend/app/(public)/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/productcard";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import NextLink from "next/link";
import { Product, Category } from "@/types";
import api from "@/libs/api";
import { Skeleton } from "@heroui/skeleton";

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default "all" tapi kita handle di string kosong atau key tertentu
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        // Handle Products
        const productsData = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data?.data || [];

        // Sorting berdasarkan ID terbesar (Terbaru) - Descending
        // Asumsi ID auto increment, ID gede = barang baru
        productsData.sort((a: Product, b: Product) => b.id - a.id);

        setProducts(productsData);

        // Handle Categories
        const categoriesData = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data?.data || [];
        setCategories(categoriesData);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data. Coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔥 LOGIKA PRODUK TERBARU (Ambil 4 teratas)
  const latestProducts = products.slice(0, 4);

  // 🔥 LOGIKA FILTER UTAMA
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category?.slug === selectedCategory);

  // Helper buat Skeleton biar gak duplicate code
  const renderSkeletons = (count: number) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="rounded-lg bg-default-300 h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="w-3/5 rounded-lg h-3 bg-default-200" />
            <Skeleton className="w-4/5 rounded-lg h-3 bg-default-200" />
            <Skeleton className="w-2/5 rounded-lg h-3 bg-default-300" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative flex h-[60vh] min-h-[400px] w-full items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80"
            alt="Hero background"
            className="h-full w-full object-cover opacity-40 blur-sm scale-105"
          />
        </div>

        <div className="z-10 text-center flex flex-col items-center p-4 animate-fadeIn">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight drop-shadow-md">
            TelU<span className="text-primary-400">-Hub</span>
          </h1>
          <p className="mt-6 text-lg md:text-2xl max-w-2xl text-gray-200 font-light">
            Marketplace khusus anak Telkom University. <br />
            <span className="font-medium text-white">
              Jual Beli • Aman • Sesama Mahasiswa
            </span>
          </p>
          <div className="mt-8 flex gap-4">
            <Button
              as={NextLink}
              href="#latest" // Scroll ke section terbaru
              color="primary"
              size="lg"
              className="font-bold px-8 shadow-lg shadow-primary/40"
            >
              Belanja Sekarang
            </Button>
            <Button
              as={NextLink}
              href="/dashboard/products/new"
              variant="bordered"
              color="secondary"
              size="lg"
              className="font-bold px-8 text-white border-white hover:bg-white/10"
            >
              Mulai Jualan
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-12 space-y-16">
        {/* --- SECTION 1: PRODUK TERBARU (Fresh Blood) --- */}
        <section id="latest">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Terbaru
              </h2>
              <p className="text-default-500 mt-1">
                Barang-barang yang baru aja diposting anak Tel-U.
              </p>
            </div>
            <Button as={NextLink} href="/shop" variant="light" color="primary">
              Lihat Semua &rarr;
            </Button>
          </div>

          {loading ? (
            renderSkeletons(4)
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : latestProducts.length === 0 ? (
            <p className="text-default-500">Belum ada produk terbaru.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* --- SECTION 2: JELAJAHI SEMUA (Dengan Dropdown) --- */}
        <section className="">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Jelajahi Produk
              </h2>
              <p className="text-default-500 mt-1">
                Cari barang berdasarkan kategori favorit kamu.
              </p>
            </div>

            {/* 🔥 DROPDOWN FILTER KATEGORI */}
            <div className="w-full md:w-64">
              <Select
                label="Pilih Kategori"
                placeholder="Semua Kategori"
                className="max-w-xs"
                selectedKeys={[selectedCategory]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setSelectedCategory(value);
                }}
                items={[
                  { key: "all", name: "Semua Kategori" },
                  ...categories.map((cat) => ({
                    key: cat.slug,
                    name: cat.name,
                  })),
                ]}
              >
                {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
              </Select>
            </div>
          </div>

          {loading ? (
            renderSkeletons(4)
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-default-500">
                {selectedCategory === "all"
                  ? "Belum ada produk sama sekali."
                  : "Produk di kategori ini lagi kosong. Coba kategori lain."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default HomePage;
