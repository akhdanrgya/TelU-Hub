"use client";

import React, { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import api from "@/libs/api";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { Product } from "@/types";
import { Image } from "@heroui/image";

const EditProductPage = () => {
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const [imageFile, setImageFile] = useState<File | null>(null); // File BARU
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null); // Preview file BARU
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // Link file LAMA

  const [loading, setLoading] = useState(false); // Loading buat submit
  const [pageLoading, setPageLoading] = useState(true); // Loading buat fetch data awal
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return; // Kalo ID-nya belom siap, jangan jalan
    
    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(`/products/${id}`); 
        const product = response.data;
        
        // 3. Isi form-nya pake data yg didapet
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStock(product.stock);
        setExistingImageUrl(product.image_url); // Simpen link gambar LAMA
      } catch (err) {
        setError("Gagal mengambil data produk ini");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProduct();
  }, [id]); // Jalanin kalo 'id'-nya berubah

  // 4. Fungsi handle ganti gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Simpan file BARU
      setNewImagePreview(URL.createObjectURL(file)); // Bikin preview BARU
    }
  };

  // 5. Fungsi 'handleSubmit' buat UPDATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let finalImageUrl = existingImageUrl; // Pake URL lama dulu

    try {
      // 5a. Kalo user milih file BARU, upload dulu
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImageUrl = uploadResponse.data.imageUrl; // Dapet URL baru
      }

      // 5b. Panggil API UPDATE (PUT) ke rute SELLER yg bener
      await api.put(`/products/${id}`, { // 👈 Pake PUT /seller/products/:id
        name,
        description,
        price,
        stock,
        image_url: finalImageUrl, // Kirim URL-nya (bisa yg lama, bisa yg baru)
      });
      
      // Kalo berhasil, tendang balik ke halaman list
      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengupdate produk");
      setLoading(false);
    }
  };

  // Tampilan loading pas ngambil data
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
        <Input
          label="Nama Produk"
          value={name}
          onChange={(e) => setName(e.target.value)}
          isRequired
        />
        <Textarea
          label="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Harga (Rp)"
          type="number"
          value={String(price)}
          onChange={(e) => setPrice(Number(e.target.value))}
          isRequired
        />
        <Input
          label="Stok"
          type="number"
          value={String(stock)}
          onChange={(e) => setStock(Number(e.target.value))}
          isRequired
        />
        
        {/* --- Form Ganti Gambar --- */}
        <div>
          <label className="block text-sm font-medium text-default-700">
            Ganti Gambar Produk
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange} // Panggil fungsi handleImageChange
            className="mt-1"
          />
          
          {/* Tampilan Preview (Canggih) */}
          <div className="mt-4 text-center">
            <p className="text-sm text-default-500 mb-2">Preview Gambar:</p>
            {newImagePreview ? (
              <Image src={newImagePreview} alt="Preview" width={200} height={200} className="rounded-lg object-cover mx-auto" />
            ) : existingImageUrl ? (
              <Image src={existingImageUrl} alt="Gambar Lama" width={200} height={200} className="rounded-lg object-cover mx-auto" />
            ) : (
              <p className="text-default-400">Belom ada gambar</p>
            )}
          </div>
        </div>


        {error && <p className="text-danger">{error}</p>}
        
        <Button type="submit" color="primary" isLoading={loading} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
};

export default EditProductPage;