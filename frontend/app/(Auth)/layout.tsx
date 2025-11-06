import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/contexts/AuthContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="relative flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
          {children}
        </main>
        <Footer/>
      </div>
    </AuthProvider>
  );
}