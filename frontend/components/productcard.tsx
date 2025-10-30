// components/ProductCard.tsx
"use client"
import React from "react";

import { Button } from "@heroui/button";
import NextImage from "next/image";

type ProductCardProps = {
  name: string;
  price: number;
  imageUrl: string;
};

export const ProductCard = ({ name, price, imageUrl }: ProductCardProps) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
        <NextImage
          src={imageUrl}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="mt-1 text-base font-bold text-primary">
          Rp {price.toLocaleString("id-ID")}
        </p>
      </div>
      
      <div className="flex items-center p-4 pt-0">
        <Button 
          color="primary" 
          className="w-full"
          onPress={() => console.log(`Tambah ${name} ke keranjang!`)}
        >
          Tambah ke Keranjang
        </Button>
      </div>
    </div>
  );
};