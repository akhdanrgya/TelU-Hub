"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/libs/api";
import { Order } from "@/types";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const OrdersPage = () => {
  const { loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders");
        setOrders(response.data || []);

      } catch (err) {
        setError("Gagal mengambil riwayat pesanan");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Lagi ngambil data order..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-danger">Oops!</h1>
        <p>{error}</p>
        <Button as={NextLink} href="/" color="primary" className="mt-4">
          Kembali ke Home
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold">Belum Ada Pesanan 😅</h1>
        <p className="text-lg text-default-500 mt-4">
          Lo belom pernah checkout, King.
        </p>
        <Button as={NextLink} href="/" color="primary" className="mt-6">
          Mulai Belanja
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Riwayat Pesanan Saya</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <NextLink
            href={`/orders/${order.id}`} // 👈 Tuju ke URL dinamis
            key={order.id}
            passHref
          >

            <Card key={order.id} className="w-full">
              <CardHeader className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-default-500">Order ID</p>
                  <h2 className="font-bold text-lg">TELUHUB-{order.id}</h2>
                </div>
                <Badge
                  size="lg"
                  color={
                    order.status === 'paid' ? 'success' :
                      order.status === 'pending' ? 'warning' :
                        'danger'
                  }
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-sm text-default-600">
                  Tanggal Pesan: {formatDate(order.created_at)}
                </p>

                {/* Daftar item di order itu */}
                {order.OrderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Avatar
                      src={item.Product.image_url}
                      name={item.Product.name.charAt(0)}
                      radius="md"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.Product.name}</p>
                      <p className="text-sm text-default-500">
                        {item.quantity} x Rp {item.price_at_time.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}

              </CardBody>
              <CardFooter className="flex justify-between items-center bg-content2">
                <p className="text-default-500">Total Pembayaran</p>
                <p className="font-bold text-xl text-primary">
                  Rp {order.total_amount.toLocaleString("id-ID")}
                </p>
              </CardFooter>
            </Card>
          </NextLink>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;