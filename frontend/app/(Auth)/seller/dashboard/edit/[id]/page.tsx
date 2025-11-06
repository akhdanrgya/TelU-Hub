"use client";

import React, { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import api from "@/libs/api";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Link } from "@heroui/link";
import NextLink from "next/link";

const EditProductPage = () => {
  const params = useParams(); // Ambil ID dari URL
  const id = params.id as string;

  // State buat form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Loading buat fetch
  const [error, setError] = useState("");
  const router = useRouter();

  // 1. useEffect buat FETCH DATA PRODUK YG MAU DI-EDIT
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`); // 👈 GET /products/:id
        const product = response.data;
        // Isi form-nya pake data yg didapet
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStock(product.stock);
        setImageUrl(product.image_url);
      } catch (err) {
        setError("Gagal mengambil data produk ini");
      } finally {
        setPageLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Fungsi 'handleSubmit' buat UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put(`/products/${id}`, { // 👈 Pake API PUT
        name,
        description,
        price,
        stock,
        image_url: imageUrl,
      });
      router.push("/seller/dashboard"); // Tendang balik ke list
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengupdate produk");
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-center p-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <Button as={NextLink} href="/seller/dashboard" variant="light" className="mb-4">
        &larr; Kembali ke Daftar Produk
      </Button>
      <h1 className="text-3xl font-bold mb-6">Edit Produk</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nama Produk" value={name} onChange={(e) => setName(e.target.value)} isRequired />
        <Textarea label="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label="Harga (Rp)" type="number" value={String(price)} onChange={(e) => setPrice(Number(e.target.value))} isRequired />
        <Input label="Stok" type="number" value={String(stock)} onChange={(e) => setStock(Number(e.target.value))} isRequired />
        <Input label="URL Gambar" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

        {error && <p className="text-danger">{error}</p>}
        
        <Button type="submit" color="primary" isLoading={loading} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
};

export default EditProductPage;