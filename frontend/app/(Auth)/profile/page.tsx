"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/libs/api";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";

const ProfilePage = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    let finalImageUrl = user?.profile_image_url;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImageUrl = uploadResponse.data.imageUrl;
      }
      await api.put("/me", {
        username: username,
        profile_image_url: finalImageUrl,
      });
      
      await refreshUser();
      
      setSuccess("Profil berhasil di-update!");
      setImageFile(null);
      setNewImagePreview(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengupdate profil");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <div className="text-center p-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-lg bg-content1">
        
        <div className="flex flex-col items-center gap-4">
          <Avatar
            src={newImagePreview || user.profile_image_url} 
            name={username.charAt(0).toUpperCase()}
            className="w-32 h-32 text-4xl"
            isBordered
            color="primary"
          />
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="max-w-xs"
          />
        </div>

        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          isRequired
        />
        
        <Input
          label="Email"
          value={user.email}
          isReadOnly
          disabled
        />

        {error && <p className="text-danger text-center">{error}</p>}
        {success && <p className="text-success text-center">{success}</p>}
        
        <Button type="submit" color="primary" className="w-full" isLoading={loading} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;