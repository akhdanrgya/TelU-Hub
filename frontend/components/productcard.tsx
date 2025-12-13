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

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, loadingCart } = useAuth();
  const liveStock = useStockStream(product?.id || null);

  const handleAddToCartClick = () => {
    addToCart(product.id, 1);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col justify-between">
      <div>
        <NextLink href={`/products/${product.slug}`} passHref>
          <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
            <NextImage
              src={product.image_url}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
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

          <p className="mt-1 text-base font-bold text-primary">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          <p className="text-sm text-default-600 mt-1">Stok: {liveStock !== null ? liveStock : product.stock}</p>
          <p className="text-sm text-default-500 mt-1 truncate">
            dijual oleh:{" "}
            <Link
              as={NextLink}
              href={`/profile/${product.seller.username}`}
              color="primary"
            >
              {product.seller.username}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-center p-4 pt-0">
        <Button
          color="primary"
          className="w-full"
          onPress={handleAddToCartClick}
          disabled={product.stock === 0 || loadingCart}
          isLoading={loadingCart}
        >
            {(liveStock !== null ? liveStock : product.stock) === 0 
              ? "Stok Habis" 
              : "Tambah ke Keranjang"}
        </Button>
      </div>
    </div>
  );
};
