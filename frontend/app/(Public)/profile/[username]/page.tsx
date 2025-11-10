"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import api from "@/libs/api";
import { PublicProfile, Product } from "@/types";
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { ProductCard } from "@/components/productcard";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const UserProfilePage = () => {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (username) {
      const fetchProfileData = async () => {
        try {
          setLoading(true);
          setError("");
          
          const [profileResponse, productsResponse] = await Promise.all([
            api.get(`/users/${username}`),
            api.get(`/users/${username}/products`)
          ]);
          
          setProfile(profileResponse.data);
          setProducts(productsResponse.data || []); 

        } catch (err: any) {
          setError(err.response?.data?.error || "User atau produk tidak ditemukan");
        } finally {
          setLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [username]);

  if (loading) {
    return <div className="text-center p-10"><Spinner size="lg" /></div>;
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-danger">404 - User Not Found</h1>
        <p>{error}</p>
        <Button as={NextLink} href="/" color="primary" className="mt-4">
          Kembali ke Home
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto flex flex-col items-center">
      <Avatar
        src={profile.profile_image_url}
        name={profile.username.charAt(0).toUpperCase()}
        className="w-40 h-40 text-6xl"
        isBordered
        color={
          profile.role === 'admin' ? 'secondary' :
          profile.role === 'seller' ? 'primary' :
          'default'
        }
      />
      <h1 className="text-4xl font-bold mt-4">{profile.username}</h1>
      <span className={`mt-2 px-3 py-1 rounded-full text-sm font-bold ${
        profile.role === 'admin' ? 'bg-secondary text-secondary-foreground' : 
        profile.role === 'seller' ? 'bg-primary text-primary-foreground' : 
        'bg-default-200'
      }`}>
        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
      </span>
      <p className="text-default-500 mt-4">
        Bergabung sejak {formatDate(profile.joined_at)}
      </p>


      <div className="mt-10 w-full">
        <h2 className="text-2xl font-bold text-center md:text-left">Produk {profile.username}</h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-4 p-8 border rounded-lg text-center bg-content1">
            <p className="text-default-500">
              Yah, {profile.username} belom jualan apa-apa... 😅
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;