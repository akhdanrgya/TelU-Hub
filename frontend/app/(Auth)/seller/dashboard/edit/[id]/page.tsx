"use client";

import React, { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import api from "@/libs/api";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { Product, Category } from "@/types";
import { Image } from "@heroui/image";

const EditProductPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  
  const [categoryId, setCategoryId] = useState(""); 
  const [categories, setCategories] = useState<Category[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setPageLoading(true);
        const [productRes, categoryRes] = await Promise.all([
            api.get<Product>(`/products/${id}`),
            api.get("/categories")
        ]);

        const product = productRes.data;
        
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStock(product.stock);
        setExistingImageUrl(product.image_url);

        if (product.category?.ID) {
            setCategoryId(String(product.category.ID));
        } else if (product.category_id) {
            setCategoryId(String(product.category_id));
        }

        const cats = Array.isArray(categoryRes.data) ? categoryRes.data : categoryRes.data.data;
        setCategories(cats);

      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data produk ini");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
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
        price: Number(price),
        stock: Number(stock),
        category_id: Number(categoryId),
        image_url: finalImageUrl,
      });

      router.push("/seller/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal mengupdate produk");
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="text-center p-10"><Spinner size="lg" label="Loading data..." /></div>;
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

        <Select 
            label="Kategori" 
            placeholder="Pilih kategori"
            selectedKeys={categoryId ? [categoryId] : []}
            onChange={(e) => setCategoryId(e.target.value)}
            items={categories}
            isRequired
        >
            {(item) => (
                <SelectItem key={String(item.ID)} textValue={item.name}>
                    {item.name}
                </SelectItem>
            )}
        </Select>

        <Textarea
          label="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <div className="flex gap-4">
            <Input
            label="Harga (Rp)"
            type="number"
            value={String(price)}
            onChange={(e) => setPrice(Number(e.target.value))}
            isRequired
            className="flex-1"
            />
            <Input
            label="Stok"
            type="number"
            value={String(stock)}
            onChange={(e) => setStock(Number(e.target.value))}
            isRequired
            className="flex-1"
            />
        </div>
      
        <div className="border p-4 rounded-lg bg-default-50">
          <label className="block text-sm font-medium text-default-700 mb-2">
            Gambar Produk
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          
          <div className="mt-4 flex justify-center">
            {newImagePreview ? (
              <div className="text-center">
                  <p className="text-xs text-default-400 mb-1">Preview Baru</p>
                  <Image src={newImagePreview} alt="Preview" width={200} height={200} className="rounded-lg object-cover" />
              </div>
            ) : existingImageUrl ? (
               <div className="text-center">
                  <p className="text-xs text-default-400 mb-1">Gambar Saat Ini</p>
                  <Image src={existingImageUrl} alt="Gambar Lama" width={200} height={200} className="rounded-lg object-cover" />
              </div>
            ) : (
              <p className="text-default-400">Belom ada gambar</p>
            )}
          </div>
        </div>

        {error && <p className="text-danger text-center font-semibold">{error}</p>}
        
        <Button type="submit" color="primary" size="lg" className="w-full font-bold" isLoading={loading} disabled={loading}>
          {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
};

export default EditProductPage;