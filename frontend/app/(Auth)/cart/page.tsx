"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import NextLink from "next/link";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import api from "@/libs/api";

declare global {
  interface Window {
    snap: any;
  }
}

const CartPage = () => {
  const {
    cart,
    loading: authLoading,
    loadingCart,
    updateCartQuantity,
    removeCartItem,
    fetchCart
  } = useAuth();

  const subtotal = cart?.CartItems
    ? cart.CartItems.reduce(
      (total, item) => total + item.quantity * item.Product.price,
      0
    )
    : 0;
  const total = subtotal;

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

const handleCheckout = async () => {
    setCheckoutLoading(true);
    
    try {
      const response = await api.post("/checkout", {});
      const { snap_token, order_id } = response.data;
      
      window.snap.pay(snap_token, {
        onSuccess: (result: any) => {
          console.log("Pembayaran Sukses!", result);
          router.push(`/orders/${order_id}`); 
          setCheckoutLoading(false); 
        },
        onPending: (result: any) => {
          console.log("Pembayaran Pending", result);
          router.push(`/orders/${order_id}`);
          setCheckoutLoading(false); 
        },
        onError: (error: any) => {
          console.error("Pembayaran Error", error);
          alert("Pembayaran Gagal");
          setCheckoutLoading(false); 
        },
        onClose: () => {
          console.log("Popup Midtrans ditutup");
          setCheckoutLoading(false);
        }
      });
      
    } catch (err) {
      console.error(err);
      alert("Gagal membuat order (API Error)");
      setCheckoutLoading(false); 
    } 
  };

  if (authLoading) {
    return <div className="text-center p-10"><Spinner size="lg" /></div>;
  }

  if (!cart || cart.CartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold">Keranjang Kosong 🛒</h1>
        <p className="text-lg text-default-500 mt-4">
          Cari barang dulu gih
        </p>
        <Button as={NextLink} href="/" color="primary" className="mt-6">
          Mulai Belanja
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-4">
          {cart.CartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-content1">
              <Avatar
                src={item.Product.image_url}
                name={item.Product.name.charAt(0)}
                size="lg"
                radius="md"
              />
              <div className="flex-grow">
                <Link as={NextLink} href={`/products/${item.Product.slug}`} className="font-semibold text-lg" color="foreground">
                  {item.Product.name}
                </Link>
                <p className="text-primary font-bold">
                  Rp {item.Product.price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                  isLoading={loadingCart}
                >
                  <FiMinus />
                </Button>

                <span className="w-10 text-center font-bold">{item.quantity}</span>

                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                  isLoading={loadingCart}
                >
                  <FiPlus />
                </Button>
              </div>

              <div className="w-32 text-right">
                <p className="font-bold text-lg">
                  Rp {(item.quantity * item.Product.price).toLocaleString("id-ID")}
                </p>
              </div>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => removeCartItem(item.id)}
                isLoading={loadingCart}
              >
                <FiTrash2 />
              </Button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg bg-content1 sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Ringkasan</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-default-600">Subtotal ({subtotal} item)</p>
                <p className="font-semibold">Rp {subtotal.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-default-600">Biaya Admin</p>
                <p className="font-semibold">Rp 0</p>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p>Rp {total.toLocaleString("id-ID")}</p>
              </div>
            </div>

            <Button
              color="primary"
              className="w-full mt-6"
              size="lg"
              onPress={handleCheckout}
              isLoading={checkoutLoading}
              disabled={checkoutLoading || loadingCart || !cart || cart.CartItems.length === 0}
            >
              {checkoutLoading ? "Memproses..." : "Lanjut ke Checkout"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;