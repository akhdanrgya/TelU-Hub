import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Badge } from "@heroui/badge";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

import { FiShoppingCart, FiUser } from "react-icons/fi"; 

export const Navbar = () => {
  const navItems = [
    { label: "Shop", href: "/shop" },
    { label: "Kategori", href: "/categories" },
    { label: "Tentang Kami", href: "/about" },
  ];

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* --- BAGIAN KIRI: LOGO & NAVIGASI --- */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">TelU-Hub Store</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className="data-[active=true]:text-primary data-[active=true]:font-medium"
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* --- BAGIAN KANAN: AUTH, CART, THEME --- */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        
        {/* INI DIA TOMBOL E-COMMERCE-NYA */}
        <NavbarItem className="hidden md:flex gap-2">
          <Button
            as={NextLink}
            href="/login"
            variant="ghost" // Bikin transparan
            startContent={<FiUser size={18} />}
          >
            Login
          </Button>

          <Button
            as={NextLink}
            href="/cart"
            variant="flat" // Pake background
            color="primary"
          >
            <Badge content="3" color="danger"> {/* Angka 3 ini nanti dari state */}
              <FiShoppingCart size={20} />
            </Badge>
            <span className="ml-2">Keranjang</span>
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* --- MENU MOBILE (HP) --- */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NextLink href="/cart">
          <FiShoppingCart size={20} />
        </NextLink>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {/* ... (Menu mobile bisa lo isi nanti) ... */}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {/* ... (Looping nav items) ... */}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};