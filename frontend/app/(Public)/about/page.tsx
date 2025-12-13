"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import NextLink from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* --- HERO SECTION --- */}
      <section className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden bg-gray-900 text-center">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80"
            alt="Telkom University Campus"
            className="h-full w-full object-cover opacity-40 blur-sm"
          />
        </div>

        {/* Hero Content */}
        <div className="z-20 max-w-4xl px-6 animate-fadeIn">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Menghubungkan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              Civitas Akademika
            </span>{" "}
            <br />
            Dalam Satu Ekosistem.
          </h1>
          <p className="mt-6 text-lg text-gray-300 md:text-xl font-light">
            TelU-Hub bukan sekadar marketplace. Ini adalah wujud digitalisasi
            ekonomi mahasiswa Telkom University yang aman, terintegrasi, dan
            profesional.
          </p>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="container mx-auto -mt-16 relative z-30 px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "Mahasiswa Terdaftar", value: "10,000+", icon: "🎓" },
            { label: "Transaksi Aman", value: "100%", icon: "🛡️" },
            { label: "Produk UMKM Kampus", value: "500+", icon: "🚀" },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className="border-none shadow-xl bg-content1/80 backdrop-blur-md"
            >
              <CardBody className="flex flex-col items-center justify-center p-8 text-center">
                <span className="text-4xl mb-2">{stat.icon}</span>
                <h3 className="text-3xl font-bold text-primary">
                  {stat.value}
                </h3>
                <p className="text-default-500 font-medium">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* --- VISION & MISSION --- */}
      <section className="container mx-auto max-w-6xl py-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Visi Kami: <br />
              <span className="text-primary">Inovasi Tanpa Batas.</span>
            </h2>
            <p className="text-lg text-default-600 leading-relaxed text-justify">
              Lahir dari keresahan akan sulitnya mencari kebutuhan kuliah secara
              cepat dan terpercaya, TelU-Hub hadir sebagai solusi. Kami percaya
              bahwa mahasiswa Telkom University memiliki potensi
              entrepreneurship yang luar biasa.
            </p>
            <p className="text-lg text-default-600 leading-relaxed text-justify">
              Platform ini dibangun dengan standar teknologi industri terkini,
              memastikan setiap transaksi berjalan mulus, data terlindungi, dan
              pengalaman pengguna yang setara dengan e-commerce global.
            </p>

            <div className="pt-4">
              <h4 className="font-bold text-lg mb-2">Nilai Utama Kami:</h4>
              <ul className="list-disc list-inside text-default-600 space-y-1">
                <li>Integritas & Keamanan Data</li>
                <li>Pemberdayaan Ekonomi Mahasiswa</li>
                <li>Inovasi Teknologi Berkelanjutan</li>
              </ul>
            </div>
          </div>

          {/* Right: Image Composition */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 blur-xl"></div>
            <Image
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
              alt="Team Collaboration"
              className="rounded-2xl shadow-2xl relative z-10"
            />
          </div>
        </div>
      </section>

      <Divider className="my-10 max-w-6xl mx-auto" />

      {/* --- THE DEVELOPER (Personal Branding King Akhdan) --- */}
      {/* --- THE DEVELOPERS (Dream Team) --- */}
      <section className="container mx-auto max-w-6xl py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Meet The Minds</h2>
        <p className="text-default-500 max-w-2xl mx-auto mb-12">
          Dibangun dengan dedikasi tinggi oleh tim terbaik Sistem Informasi.
        </p>

        {/* Grid Layout 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. AKHDAN (King) */}
          <Card className="border border-default-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex gap-4 justify-center bg-gray-50 py-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=KingAkhdan"
                    alt="Akhdan"
                    className="w-full h-full rounded-full bg-white"
                  />
                </div>
                <h3 className="text-xl text-primary font-bold mt-4">
                  Akhdan Anargya Arisadi
                </h3>
                <p className="text-default-500 font-semibold text-sm">
                  Founder & Lead Engineer
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-8 py-6 text-center">
              <p className="italic text-default-600 text-sm">
                "Gue percaya teknologi itu harus mempermudah hidup. TelU-Hub
                adalah bukti konkrit visi kami."
              </p>
              <div className="mt-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-mono">
                  Fullstack
                </span>
              </div>
            </CardBody>
          </Card>

          {/* 2. ENRICO */}
          <Card className="border border-default-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex gap-4 justify-center bg-gray-50 py-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-1">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Enrico"
                    alt="Enrico"
                    className="w-full h-full rounded-full bg-white"
                  />
                </div>
                <h3 className="text-xl text-primary font-bold mt-4">
                  Enrico Steven Ernest
                </h3>
                <p className="text-default-500 font-semibold text-sm">
                  Co-Founder & Backend Specialist
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-8 py-6 text-center">
              <p className="italic text-default-600 text-sm">
                "Infrastruktur yang kuat adalah kunci. Kami memastikan server
                tetap stabil walau trafik badai."
              </p>
              <div className="mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-mono">
                  Infrastructure
                </span>
              </div>
            </CardBody>
          </Card>

          {/* 3. ARVIA */}
          <Card className="border border-default-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex gap-4 justify-center bg-gray-50 py-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 p-1">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=ArviaMarthina"
                    alt="Arvia"
                    className="w-full h-full rounded-full bg-white"
                  />
                </div>
                <h3 className="text-xl text-primary font-bold mt-4">
                  Arvia Marthina Keliduan
                </h3>
                <p className="text-default-500 font-semibold text-sm">
                  Lead UI/UX Designer
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-8 py-6 text-center">
              <p className="italic text-default-600 text-sm">
                "Desain bukan cuma tentang apa yang terlihat, tapi tentang
                bagaimana user merasakannya."
              </p>
              <div className="mt-4">
                <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-mono">
                  Creative
                </span>
              </div>
            </CardBody>
          </Card>

          {/* 4. NADYA */}
          <Card className="border border-default-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex gap-4 justify-center bg-gray-50 py-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 p-1">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=NadyaCalista"
                    alt="Nadya"
                    className="w-full h-full rounded-full bg-white"
                  />
                </div>
                <h3 className="text-xl text-primary font-bold mt-4">
                  Nadya Calista Andini
                </h3>
                <p className="text-default-500 font-semibold text-sm">
                  Business Analyst & QA
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-8 py-6 text-center">
              <p className="italic text-default-600 text-sm">
                "Kualitas adalah prioritas utama. Detail sekecil apapun
                menentukan kepuasan pengguna."
              </p>
              <div className="mt-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-mono">
                  Analyst
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="text-white py-20 mt-12">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Siap Menjadi Bagian dari Revolusi?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Jangan cuma jadi penonton. Mulai bisnis kamu sekarang atau temukan
            barang impian dengan harga mahasiswa.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              as={NextLink}
              href="/register"
              color="primary"
              size="lg"
              className="font-bold px-8"
            >
              Daftar Sekarang
            </Button>
            <Button
              as={NextLink}
              href="/shop"
              variant="bordered"
              color="primary"
              size="lg"
              className="font-bold px-8 border-primary hover:bg-white/10"
            >
              Lihat Produk
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
