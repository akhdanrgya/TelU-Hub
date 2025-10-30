"use client"

import React from "react";
import { ProductCard } from "@/components/productcard";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import Link from "next/link";

const dummyProducts = [
  {
    name: "Baju Kemeja Ngoding",
    price: 150000,
    imageUrl: "https://images.unsplash.com/photo-1598032895368-c15aaA50135a?w=500",
  },
  {
    name: "Mouse Gaming TelU",
    price: 320000,
    imageUrl: "https://images.unsplash.com/photo-1615663245657-ac865b36e156?w=500",
  },
  {
    name: "Hoodie HMTI Keren",
    price: 250000,
    imageUrl: "https://images.unsplash.com/photo-1556102044-f252a7587d15?w=500",
  },
  {
    name: "Stiker Laptop 'IPK 4'",
    price: 10000,
    imageUrl: "https://images.unsplash.com/photo-1527799815412-6c30807190f8?w=500",
  },
];


const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main> {/* Bikin tag <main> buat konten utama */}
        
        {/* === BLOK 2: HERO === */}
        <section className="relative flex h-[60vh] min-h-[400px] w-full items-center justify-center bg-gray-900 text-white">
          {/* Ini gambar background (pake NextImage biar keren) */}
          <div className="absolute inset-0 z-0">
             <img 
               src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
               alt="Hero background"
               className="h-full w-full object-cover opacity-50"
             />
          </div>
          
          {/* Ini Tulisannya */}
          <div className="z-10 text-center p-4">
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

        
        {/* === BLOK 3: PRODUCT GRID === */}
        <section className="container mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-6 text-3xl font-bold">
            Produk Terbaru
          </h2>
          
          {/* Ini "Etalase"-nya (Pake Tailwind Grid) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Kita looping data dummy-nya di sini */}
            {dummyProducts.map((product, index) => (
              <ProductCard
                key={index}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
              />
            ))}
            
          </div>
        </section>

      </main>
    </div>
  );
};

export default HomePage;