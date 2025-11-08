"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/libs/api";
import { Product } from "@/types"; // Tipe data Product (yang ada 'seller'-nya)
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table"; 
import { Spinner } from "@heroui/spinner"; 
import NextLink from "next/link";
import { useRouter } from "next/navigation";
// Import Modal (kita copy dari seller dashboard)
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure 
} from "@heroui/modal";

const AdminProductManagementPage = () => {
  const { user: adminUser, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // State Modal (Sama kayak Seller)
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- 1. Fungsi Fetch (BEDA API) ---
  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      // 🚨 KITA PAKE API "GET ALL PRODUCTS" (BUKAN /me/products)
      const response = await api.get("/products"); 
      setProducts(response.data);
    } catch (err) {
      setError("Gagal mengambil semua produk");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. useEffect (Cek 'admin') ---
  useEffect(() => {
    if (!authLoading) {
      if (adminUser?.role === "admin") {
        fetchAllProducts();
      } else {
        router.push("/"); // Kalo bukan admin, tendang!
      }
    }
  }, [adminUser, authLoading, router]);

  // --- 3. Fungsi Hapus (SAMA PERSIS kayak Seller) ---
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      // Admin Boleh nge-delete produk siapa aja
      await api.delete(`/products/${productToDelete.id}`);
      fetchAllProducts(); // Refresh list
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

  // --- 4. Tampilan Loading (SAMA) ---
  if (authLoading || loading) { 
    return <div className="text-center p-10"><Spinner size="lg" /></div>;
  }
 
  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin: Product Management</h1>
        {/* Admin gak perlu tombol "Tambah Produk", 
            dia bisa pake Seller Dashboard-nya sendiri kalo mau jualan */}
      </div>

      {error && <p className="text-danger mb-4 text-center">{error}</p>}

      <Table aria-label="Tabel Semua Produk">
        <TableHeader>
            <TableColumn>Nama Produk</TableColumn>
            <TableColumn>Penjual (Seller)</TableColumn>
            <TableColumn>Harga</TableColumn>
            <TableColumn>Stok</TableColumn>
            <TableColumn>Aksi</TableColumn>
        </TableHeader>
        <TableBody
          items={products}
          emptyContent={"Belum ada produk apapun di platform ini."}
        >
          {(product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                <Link as={NextLink} href={`/seller/${product.seller.id}`} size="sm">
                  {product.seller.username}
                </Link>
              </TableCell>

              <TableCell>Rp {product.price.toLocaleString("id-ID")}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  as={NextLink}
                  // Admin pake link Edit yang sama, karena backend ngebolehin
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

      {/* --- Modal Konfirmasi Hapus (SAMA) --- */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Konfirmasi Hapus Produk
              </ModalHeader>
              <ModalBody>
                <p>Lo yakin mau ngehapus produk ini secara permanen?</p>
                <p className="font-bold text-lg">{productToDelete?.name}</p>
                <p className="text-sm text-default-500">
                  Seller: <span className="font-medium">{productToDelete?.seller.username}</span>
                </p>
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

export default AdminProductManagementPage;