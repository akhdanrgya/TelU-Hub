// frontend/app/(public)/page.tsx
"use client"

import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/productcard";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { Product } from "@/types";
import api from "@/libs/api";


const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/products");

        setProducts(response.data);
      } catch (err) {
        console.error("Gagal fetch produk:", err);
        setError("Gagal memuat produk. Coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProductGrid = () => {
    if (loading) {
      return <p className="text-center text-lg">Sedang memuat data Product</p>;
    }

    if (error) {
      return <p className="text-center text-lg text-danger">{error}</p>;
    }

    if (products.length === 0) {
      return <p className="text-center text-lg">Yah, belom ada produk yang dijual 😅</p>;
    }
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <section className="relative flex h-[60vh] min-h-[400px] w-full items-center justify-center bg-gray-900 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
            alt="Hero background"
            className="h-full w-full object-cover opacity-50"
          />
        </div>

        <div className="z-10 text-center flex flex-col items-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            Diskon Kebut Telkom ⚡
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-lg">
            Barang keren kualitas pejabat, harga sobat mahasiswa.
          </p>
          <Button 
            as={NextLink} 
            href="/shop" 
            color="primary" 
            size="lg" 
            className="mt-6"
          >
            Lihat Semua Produk
          </Button>
        </div>
      </section>


      <section className="container mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-3xl font-bold">
          Produk Terbaru
        </h2>

        {renderProductGrid()}

      </section>
    </>
  );
};

export default HomePage;