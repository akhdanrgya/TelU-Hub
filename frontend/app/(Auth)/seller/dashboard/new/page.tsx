"use client";

import React, { useState } from "react";
import { Input, Textarea } from "@heroui/input"; 
import { Button } from "@heroui/button";
import api from "@/libs/api";
import { useRouter } from "next/navigation";
import { Link } from "@heroui/link";
import NextLink from "next/link";

const NewProductPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/products", { // 👈 Pake API POST
        name,
        description,
        price,
        stock,
        image_url: imageUrl, 
      });
      router.push("/seller/dashboard"); // Tendang balik ke list
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menambah produk");
      setLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <Button as={NextLink} href="/seller/dashboard" variant="light" className="mb-4">
        &larr; Kembali ke Daftar Produk
      </Button>
      <h1 className="text-3xl font-bold mb-6">Tambah Produk Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama Produk" value={name} onChange={(e) => setName(e.target.value)} isRequired />
        <Textarea label="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="Harga (Rp)" type="number" value={String(price)} onChange={(e) => setPrice(Number(e.target.value))} isRequired min={0} />
        <Input label="Stok" type="number" value={String(stock)} onChange={(e) => setStock(Number(e.target.value))} isRequired min={0} />
        <Input label="URL Gambar" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

        {error && <p className="text-danger">{error}</p>}
        
        <Button type="submit" color="primary" isLoading={loading} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Produk"}
        </Button>
      </form>
    </div>
  );
};

export default NewProductPage;