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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(`/products/${id}`); 
        const product = response.data;
        
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStock(product.stock);
        setExistingImageUrl(product.image_url);
      } catch (err) {
        setError("Gagal mengambil data produk ini");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let finalImageUrl = existingImageUrl;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImageUrl = uploadResponse.data.imageUrl;
      }

      await api.put(`/products/${id}`, {
        name,
        description,
        price,
        stock,
        image_url: finalImageUrl,
      });
      router.push("/seller/dashboard");
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
      
        <div>
          <label className="block text-sm font-medium text-default-700">
            Ganti Gambar Produk
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1"
          />
          
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