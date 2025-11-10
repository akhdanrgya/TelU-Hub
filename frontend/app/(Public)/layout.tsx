import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/footer";
import React from "react";
import Script from "next/script";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider> 
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      
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