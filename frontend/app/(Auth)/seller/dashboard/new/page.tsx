"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/libs/api";
import { Input, Textarea } from "@heroui/input"; // Gabungin import biar rapi
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Select, SelectItem } from "@heroui/select"; // 👈 Import Select & SelectItem
import { json } from "stream/consumers";

// Definisi tipe simpel buat Category
interface Category {
  ID: number;
  name: string;
  slug: string;
}

const AddProductPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  
  // 🔥 State Kategori
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(""); // Pake string dulu buat handling form input

  // State Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // 1️⃣ Fetch Kategori pas component dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        console.log(`INI DATA ${JSON.stringify(data)}}`)
        setCategories(data);
      } catch (err) {
        console.error("Gagal ambil kategori", err);
      }
    };
    fetchCategories();
  }, []);

  if (authLoading) {
    return <div className="text-center p-10"><Spinner size="lg" /></div>;
  }

  if (!user || user.role !== "seller") {
    router.push("/");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); 
      setImagePreviewUrl(URL.createObjectURL(file)); 
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFormErrors({});

    let currentFormErrors: { [key: string]: string } = {};
    if (!name) currentFormErrors.name = "Nama produk harus diisi.";
    if (!description) currentFormErrors.description = "Deskripsi produk harus diisi.";
    if (!price || parseFloat(price) <= 0) currentFormErrors.price = "Harga harus angka positif.";
    if (!stock || parseInt(stock) <= 0) currentFormErrors.stock = "Stok harus angka positif.";
    if (!imageFile) currentFormErrors.imageFile = "Gambar produk harus diupload.";
    
    // 🔥 Validasi Kategori
    if (!categoryId) currentFormErrors.category = "Pilih kategori dulu dong, King.";

    if (Object.keys(currentFormErrors).length > 0) {
      setFormErrors(currentFormErrors);
      setLoading(false);
      return;
    }

    let imageUrl = ""; 
    try {
      // 1. Upload Image
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile); 

        const uploadResponse = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadResponse.data.imageUrl; 
      }

      // 2. Submit Product Data
      await api.post("/products", {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: imageUrl, 
        category_id: parseInt(categoryId),
      });

      router.push("/"); 
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal menambah produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-md p-6">
        <CardHeader className="flex flex-col items-center">
          <h1 className="text-3xl font-bold">Tambah Produk Baru</h1>
          <p className="text-default-500 mt-2">Isi detail produk kamu</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Produk"
              placeholder="Masukkan nama produk"
              value={name}
              onValueChange={setName}
              isInvalid={!!formErrors.name}
              errorMessage={formErrors.name}
              required
            />
            
            {/* 🔥 DROPDOWN KATEGORI DI SINI */}
            <Select 
                label="Kategori" 
                placeholder="Pilih kategori produk"
                selectedKeys={categoryId ? [categoryId] : []}
                onChange={(e) => setCategoryId(e.target.value)}
                isInvalid={!!formErrors.category}
                errorMessage={formErrors.category}
                items={categories}
            >
                {(item) => (
                    <SelectItem key={String(item.ID)} textValue={item.name}>
                        {item.name}
                    </SelectItem>
                )}
            </Select>

            <Textarea
              label="Deskripsi"
              placeholder="Tulis deskripsi produk"
              value={description}
              onValueChange={setDescription}
              isInvalid={!!formErrors.description}
              errorMessage={formErrors.description}
              required
            />
            
            <div className="flex gap-4">
                <Input
                label="Harga"
                placeholder="0"
                type="number"
                value={price}
                onValueChange={setPrice}
                startContent={
                    <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">Rp</span>
                    </div>
                }
                isInvalid={!!formErrors.price}
                errorMessage={formErrors.price}
                required
                className="flex-1"
                />
                <Input
                label="Stok"
                placeholder="0"
                type="number"
                value={stock}
                onValueChange={setStock}
                isInvalid={!!formErrors.stock}
                errorMessage={formErrors.stock}
                required
                className="w-1/3"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-default-700">
                Gambar Produk
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1"
                isInvalid={!!formErrors.imageFile}
                errorMessage={formErrors.imageFile}
                required
              />

              {imagePreviewUrl && (
                <div className="mt-4 flex flex-col items-center p-2 border rounded-lg bg-gray-50">
                  <p className="text-xs text-default-500 mb-2">Preview:</p>
                  <Image
                    src={imagePreviewUrl}
                    alt="Image Preview"
                    width={150}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-danger text-sm text-center font-semibold bg-danger-50 p-2 rounded">{error}</p>
            )}

            <Button type="submit" color="primary" className="w-full font-bold text-lg" isLoading={loading}>
              {loading ? <Spinner color="white" size="sm" /> : "Upload Produk"}
            </Button>
          </form>
        </CardBody>
      </Card>
  );
};

export default AddProductPage;