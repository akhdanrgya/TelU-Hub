"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/libs/api";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Image } from "@heroui/image"; // Buat preview gambar

const AddProductPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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

    if (Object.keys(currentFormErrors).length > 0) {
      setFormErrors(currentFormErrors);
      setLoading(false);
      return;
    }

    let imageUrl = ""; 
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile); 

        const uploadResponse = await api.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data", 
          },
        });
        imageUrl = uploadResponse.data.imageUrl; 
      }

      await api.post("/products", {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: imageUrl, 
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
            <Textarea
              label="Deskripsi"
              placeholder="Tulis deskripsi produk"
              value={description}
              onValueChange={setDescription}
              isInvalid={!!formErrors.description}
              errorMessage={formErrors.description}
              required
            />
            <Input
              label="Harga"
              placeholder="0.00"
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
            />

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
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-sm text-default-500 mb-2">Preview:</p>
                  <Image
                    src={imagePreviewUrl}
                    alt="Image Preview"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <Button type="submit" color="primary" className="w-full" isLoading={loading}>
              {loading ? <Spinner color="white" size="sm" /> : "Tambah Produk"}
            </Button>
          </form>
        </CardBody>
      </Card>
  );
};

export default AddProductPage;