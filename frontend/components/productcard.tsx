// frontend/components/ProductCard.tsx
"use client";

import React from "react";
import { Button } from "@heroui/button";
import NextImage from "next/image";
import { Product } from "@/types";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useStockStream } from "@/hooks/useStockStream";
import { Chip } from "@heroui/chip"; // 👈 Import Chip buat Badge Keren

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, loadingCart } = useAuth();
  const liveStock = useStockStream(product?.id || null);

  const handleAddToCartClick = () => {
    addToCart(product.id, 1);
  };

  const currentStock = liveStock !== null ? liveStock : product.stock;

  return (
    <div className="group rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div>
        <NextLink href={`/products/${product.slug}`} passHref>
          <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
            <div className="absolute top-2 left-2 z-10">
              <Chip size="sm" color="secondary" variant="flat" className="capitalize">
                {product.category?.name || "Uncategorized"}
              </Chip>
            </div>

            <NextImage
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={true}
            />
          </div>
        </NextLink>

        <div className="p-4">
          <NextLink href={`/products/${product.slug}`} passHref>
            <h3
              className="text-lg font-semibold truncate hover:text-primary transition-colors"
              title={product.name}
            >
              {product.name}
            </h3>
          </NextLink>

          <p className="mt-1 text-lg font-bold text-primary">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          
          <div className="flex justify-between items-center mt-2 text-sm text-default-500">
             <span>Stok: <span className={currentStock < 5 ? "text-red-500 font-bold" : ""}>{currentStock}</span></span>
          </div>

          <p className="text-xs text-default-400 mt-1 truncate">
            Penjual:{" "}
            <Link
              as={NextLink}
              href={`/profile/${product.seller?.username}`}
              className="text-xs hover:underline"
              color="foreground"
            >
              {product.seller?.username || "Unknown"}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-center p-4 pt-0">
        <Button
          color="primary"
          className="w-full font-medium"
          onPress={handleAddToCartClick}
          disabled={currentStock === 0 || loadingCart}
          isLoading={loadingCart}
          variant={currentStock === 0 ? "flat" : "solid"}
        >
            {currentStock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
        </Button>
      </div>
    </div>
  );
};