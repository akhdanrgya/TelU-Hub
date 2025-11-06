"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/libs/api";
import { Product } from "@/types";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

const MyProductsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/me/products");
      setProducts(response.data);
    } catch (err) {
      setError("Gagal mengambil produk Anda");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user?.role === "seller" || user?.role === "admin") {
        fetchMyProducts();
      } else {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    setError("");
    try {
      await api.delete(`/products/${productToDelete.id}`);
      fetchMyProducts();
      onClose();
    } catch (err) {
      setError("Gagal menghapus produk.");
    } finally {
      setDeleteLoading(false);
      setProductToDelete(null);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    onOpen();
  };
  
  if (authLoading || loading) {
    return (
      <div className="text-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produk Saya</h1>
        <Button as={NextLink} href="/seller/dashboard/new" color="primary">
          Tambah Produk Baru
        </Button>
      </div>

      {error && <p className="text-danger mb-4 text-center">{error}</p>}

      <Table aria-label="Tabel Produk Saya">
        <TableHeader>
          <TableColumn>Nama Produk</TableColumn>
          <TableColumn>Harga</TableColumn>
          <TableColumn>Stok</TableColumn>
          <TableColumn>Aksi</TableColumn>
        </TableHeader>
        <TableBody
          items={products}
          emptyContent={"Lo belom jualan apa-apa, King."}
        >
          {(product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {product.price != null
                  ? `Rp ${product.price.toLocaleString("id-ID")}`
                  : "N/A"}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  as={NextLink}
                  href={`/seller/dashboard/edit/${product.id}`}
                  size="sm"
                  variant="flat"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => openDeleteModal(product)}
                >
                  Hapus
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Konfirmasi Hapus Produk
              </ModalHeader>
              <ModalBody>
                <p>apakah anda yakin mau menghapus produk ini?</p>
                <p className="font-bold text-lg">{productToDelete?.name}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} disabled={deleteLoading}>
                  Batal
                </Button>
                <Button 
                  color="danger" 
                  onPress={confirmDelete}
                  isLoading={deleteLoading}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Menghapus..." : "Ya, Hapus Aja"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default MyProductsPage;