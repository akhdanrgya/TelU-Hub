"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/libs/api";
import { Order } from "@/types";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@heroui/link";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OrderDetailPage = () => {
  const params = useParams();
  const id = params.id as string; 

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { loading: authLoading } = useAuth(); 

  useEffect(() => {
    if (id && !authLoading) { 
      const fetchOrder = async () => {
        try {
          setLoading(true);
          setError("");
          
          const response = await api.get(`/orders/${id}`);
          setOrder(response.data);
          
        } catch (err: any) {
          setError(err.response?.data?.error || "Order tidak ditemukan");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Lagi ngambil data order..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-danger">404 - Order Not Found</h1>
        <p>{error}</p>
        <Button as={NextLink} href="/orders" color="primary" className="mt-4">
          Kembali ke Riwayat Pesanan
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <Button as={NextLink} href="/orders" variant="light" className="mb-4">
        &larr; Kembali ke Riwayat Pesanan
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Detail Pesanan</h1>
          <p className="text-default-500">Order ID: ORDER-{order.id}</p>
        </div>
        <Badge 
          size="lg"
          color={
            order.status === 'paid' ? 'success' :
            order.status === 'pending' ? 'warning' :
            'danger'
          }
        >
          Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-content1 p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4">Ringkasan</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-default-600">Tanggal Pesan:</span>
              <span className="font-medium">{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-600">Status Pembayaran:</span>
              <span className="font-medium">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            <div className="border-t my-2"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total Pembayaran:</span>
              <span className="text-primary">Rp {order.total_amount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-content1 p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4">Alamat Pengiriman</h2>
          <div className="space-y-1">
            <p className="font-semibold">(Data ini belum ada di DB, cuma contoh)</p>
            <p>King Akhdan</p>
            <p>Jl. Telekomunikasi No. 1</p>
            <p>Bandung, Jawa Barat, 40257</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Item yang Dipesan ({order.OrderItems.length} item)</h2>
        <div className="space-y-4">
          {order.OrderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-content1">
              <Avatar 
                src={item.Product.image_url} 
                name={item.Product.name.charAt(0)}
                radius="md"
                size="lg"
              />
              <div className="flex-grow">
                <Link as={NextLink} href={`/products/${item.Product.id}`} className="font-semibold text-lg" color="foreground">
                  {item.Product.name}
                </Link>
                <p className="text-sm text-default-500">
                  {item.quantity} x Rp {item.price_at_time.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  Rp {(item.quantity * item.price_at_time).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;