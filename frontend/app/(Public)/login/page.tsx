"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login(email, password);

      if (!success) {
        setError("Email atau Password salah. Coba lagi.");
      }
    } catch (err) {
      setError("Gagal terhubung ke server. Coba beberapa saat lagi.");
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-lg bg-content1">
        
        <h2 className="text-3xl font-bold text-center">
          Login ke TelU-Hub Store
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              fullWidth
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? "Sedang Login..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm">
          Belum punya akun?{" "}
          <Link as={NextLink} href="/register" color="primary">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;