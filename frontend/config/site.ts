export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  // Ganti nama & deskripsi
  name: "TelU-Hub Store",
  description: "Toko online keren buat sobat mahasiswa Telkom.",
  
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Shop",
      href: "/shop",
    },
    {
      label: "Kategori",
      href: "/categories",
    },
    {
      label: "Tentang Kami",
      href: "/about",
    },
  ],

  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Pesanan Saya",
      href: "/orders",
    },
    {
      label: "Pengaturan",
      href: "/settings",
    },
    {
      label: "Bantuan",
      href: "/help",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  
  links: {
    github: "https://github.com/akhdanrgya/telu-hub",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};