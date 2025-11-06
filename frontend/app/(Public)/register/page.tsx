"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import api from "@/libs/api";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak sama!");
      setLoading(false);
      return; 
    }

    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
      });

      setSuccess("Pendaftaran berhasil! Silakan login.");
      setLoading(false);
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Gagal mendaftar. Coba lagi nanti.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg bg-content1">
        
        <h2 className="text-3xl font-bold text-center">
          Buat Akun Baru
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Username"
              type="text"
              placeholder="Username unik kamu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isRequired
              fullWidth
            />
          </div>
          <div>
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              fullWidth
            />
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              fullWidth
            />
          </div>
          <div>
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ketik ulang password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isRequired
              fullWidth
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}
          {success && (
            <p className="text-success text-sm text-center">{success}</p>
          )}

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </Button>
        </form>

        <p className="text-center text-sm">
          Sudah punya akun?{" "}
          <Link as={NextLink} href="/login" color="primary">
            Login di Sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;