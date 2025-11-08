"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/libs/api";
import { User } from "@/types";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";

const AdminDashboardPage = () => {
  const { user: adminUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [userToManage, setUserToManage] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [manageLoading, setManageLoading] = useState(false);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data.filter((u: User) => u.id !== adminUser?.id));
    } catch (err) {
      setError("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (adminUser?.role === "admin") {
        fetchAllUsers();
      } else {
        router.push("/");
      }
    }
  }, [adminUser, authLoading, router]);

  const openManageModal = (user: User) => {
    setUserToManage(user);
    setNewRole(user.role);
    onOpen();
  };

  const handleRoleChange = async () => {
    if (!userToManage || !newRole) return;

    setManageLoading(true);
    try {
      await api.post(`/admin/promote/${userToManage.id}`, {
        role: newRole,
      });
      fetchAllUsers();
      onClose();
    } catch (err) {
      setError("Gagal mengupdate role");
    } finally {
      setManageLoading(false);
    }
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
        <h1 className="text-3xl font-bold">Admin Dashboard: User Management</h1>
      </div>

      {error && <p className="text-danger mb-4 text-center">{error}</p>}

      <Table aria-label="Tabel User">
        <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Username</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Role Sekarang</TableColumn>
            <TableColumn>Aksi</TableColumn>
        </TableHeader>
        <TableBody
          items={users}
          emptyContent={"Tidak ada user lain selain Anda."}
        >
          {(userItem) => (
            <TableRow key={userItem.id}>
              <TableCell>{userItem.id}</TableCell>
              <TableCell>{userItem.username}</TableCell>
              <TableCell>{userItem.email}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    userItem.role === "admin"
                      ? "bg-secondary text-secondary-foreground"
                      : userItem.role === "seller"
                        ? "bg-primary text-primary-foreground"
                        : "bg-default-200"
                  }`}
                >
                  {userItem.role}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => openManageModal(userItem)}
                >
                  Ubah Role
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
                Ubah Role untuk: {userToManage?.username}
              </ModalHeader>
              <ModalBody>
                <p>Pilih role baru untuk user ini:</p>
                <Select
                  label="Role Baru"
                  defaultSelectedKeys={[newRole]}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <SelectItem key="user">User</SelectItem>
                  <SelectItem key="seller">Seller</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={onClose}
                  disabled={manageLoading}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleRoleChange}
                  isLoading={manageLoading}
                  disabled={manageLoading}
                >
                  {manageLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
