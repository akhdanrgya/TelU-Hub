"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/libs/api";
import { Product } from "@/types";
import { Spinner } from "@heroui/spinner";
import NextImage from "next/image";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { useStockStream } from "@/hooks/useStockStream";

const ProductDetailPage = () => {

  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const liveStock = useStockStream(product?.id || null);

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          setError("");
          
          const response = await api.get(`/products/${slug}`);
          setProduct(response.data);
          
        } catch (err) {
          setError("Produk tidak ditemukan atau error");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Lagi ngambil data produk..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-danger">Produk Tidak Ditemukan</h1>
        <p>{error}</p>
        <Button as={NextLink} href="/" color="primary" className="mt-4">
          Kembali ke Home
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Kolom Kiri: Gambar */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
          <NextImage
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            priority
            unoptimized={true}
          />
        </div>
        

        <div className="flex flex-col gap-4 py-4">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          
          <p className="text-3xl font-bold text-primary">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          
          <div className="text-sm text-default-600">
            <span className="font-bold text-lg">
              Stok: {liveStock !== null ? liveStock : product.stock}
            </span>
            {liveStock !== null && (
              <span className="ml-2 text-success-600 font-bold">(Live Update!)</span>
            )}
            <span className="mx-2">|</span>
            <span>
              Dijual oleh:{" "}
              <Link as={NextLink} href={`/seller/${product.seller.username}`} color="primary">
                {product.seller.username}
              </Link>
            </span>
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Deskripsi</h2>
            <p className="text-default-700 mt-2 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <Button
            color="primary"
            size="lg"
            className="mt-6 w-full md:w-auto"
            disabled={(liveStock !== null ? liveStock : product.stock) === 0}
            onPress={() => console.log(`Tambah ${product.name} ke cart`)}
          >
            {(liveStock !== null ? liveStock : product.stock) === 0 
              ? "Stok Habis" 
              : "Tambah ke Keranjang"}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;