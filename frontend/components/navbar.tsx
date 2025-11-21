"use client";

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
import { link as linkStyles } from "@heroui/theme";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { FiShoppingCart, FiUser } from "react-icons/fi";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";


export const Navbar = () => {
  const { isAuthenticated, user, logout, loading, cart } = useAuth();

  const totalCartItems = cart?.CartItems
    ? cart.CartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="backdrop-blur-lg bg-background/70 border-b border-default-200"
    >
      {/* LEFT SIDE - BRAND + NAV */}
      <NavbarContent className="flex items-center gap-6" justify="start">
        <NavbarBrand as="li" className="flex items-center gap-2">
          <NextLink href="/" className="flex items-center gap-2">
            <Logo />
            <p className="font-bold text-lg sm:text-xl">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>

        {/* NAV LINKS (hidden on mobile) */}
        <ul className="hidden lg:flex gap-4 ml-4">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                href={item.href}
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "hover:text-primary transition-colors"
                )}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      {/* RIGHT SIDE - THEME + NOTIF + CART + AUTH */}
      <NavbarContent justify="end" className="hidden sm:flex items-center gap-4">
        <ThemeSwitch />

        {loading ? (
          <p className="text-default-500">Loading...</p>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            
            {/* 🚨 NOTIFICATION BELL (BARU) 🚨 */}
            <NotificationBell />
            
            {/* CART DROPDOWN */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button variant="light" isIconOnly>
                  <Badge
                    content={totalCartItems}
                    color="danger"
                    isInvisible={totalCartItems === 0}
                  >
                    <FiShoppingCart size={20} />
                  </Badge>
                </Button>
              </DropdownTrigger>

              <DropdownMenu
                aria-label="Cart"
                variant="flat"
                className="min-w-[340px] max-h-[400px] overflow-y-auto"
              >
                <DropdownItem isReadOnly className="font-bold text-lg" key="cart-header">
                  Keranjang Saya ({totalCartItems})
                </DropdownItem>

                {cart?.CartItems?.length ? (
                  <>
                    {cart.CartItems.map((item) => (
                      <DropdownItem
                        key={item.id}
                        as={NextLink}
                        href={`/products/${item.Product.slug}`}
                        className="py-2"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={item.Product.image_url}
                            name={item.Product.name?.charAt(0) ?? "?"}
                            size="md"
                          />
                          <div className="flex-grow">
                            <p className="font-semibold truncate">
                              {item.Product.name}
                            </p>
                            <p className="text-xs text-default-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-primary text-sm whitespace-nowrap">
                            Rp{" "}
                            {(
                              item.Product.price * item.quantity
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </DropdownItem>
                    ))}
                    <DropdownItem key="cart-footer" className="p-0 mt-2">
                      <Button
                        as={NextLink}
                        href="/cart"
                        color="primary"
                        className="w-full rounded-none"
                      >
                        Lihat Keranjang & Checkout
                      </Button>
                    </DropdownItem>
                  </>
                ) : (
                  <DropdownItem
                    key="cart-empty"
                    isReadOnly
                    className="text-center text-default-500 py-4"
                  >
                    Keranjangmu kosong
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>

            {/* USER DROPDOWN */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="cursor-pointer"
                  color="primary"
                  size="sm"
                  src={user?.profile_image_url}
                  name={user?.username?.charAt(0).toUpperCase()}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User Menu" variant="flat">
                <DropdownItem isReadOnly className="h-14" key="profile-info">
                  <p className="font-semibold">Hi, {user?.username}</p>
                  <p className="text-sm text-default-500">{user?.email}</p>
                </DropdownItem>
                <DropdownItem as={NextLink} href="/profile" key="profile">
                  Profil Saya
                </DropdownItem>
                <DropdownItem as={NextLink} href="/orders" key="orders">
                  Pesanan Saya
                </DropdownItem>
                {user?.role === "seller" ? (
                  <DropdownItem
                    as={NextLink}
                    href="/seller/dashboard"
                    color="primary"
                    key="seller-dashboard"
                  >
                    Seller Dashboard
                  </DropdownItem>
                ) : null}

                {user?.role === "admin" ? (
                  <DropdownItem
                    as={NextLink}
                    href="/admin/dashboard"
                    color="secondary"
                    key="admin-dashboard"
                  >
                    Admin Dashboard
                  </DropdownItem>
                ) : null}

                <DropdownItem color="danger" onPress={logout} key="logout">
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              as={NextLink}
              href="/login"
              variant="ghost"
              startContent={<FiUser size={18} />}
            >
              Login
            </Button>
            <Button as={NextLink} href="/register" color="primary">
              Register
            </Button>
          </div>
        )}
      </NavbarContent>

      {/* MOBILE - THEME + NOTIF + CART + TOGGLE */}
      <NavbarContent className="sm:hidden flex items-center gap-3" justify="end">
        <ThemeSwitch />
        
        {/* 🚨 NOTIFICATION BELL DI MOBILE (OPSIONAL) 🚨 */}
        {isAuthenticated && <NotificationBell />}
        
        <NextLink href="/cart" className="relative">
          <Badge
            content={totalCartItems}
            color="danger"
            isInvisible={totalCartItems === 0}
          >
            <FiShoppingCart size={22} />
          </Badge>
        </NextLink>
        <NavbarMenuToggle />
      </NavbarContent>

      {/* MOBILE MENU */}
      <NavbarMenu>
        <div className="mx-4 mt-4 flex flex-col gap-3">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={index}>
              <Link
                href={item.href}
                color={
                  index === siteConfig.navMenuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

          {isAuthenticated ? (
            <Button
              onPress={logout}
              color="danger"
              variant="flat"
              className="mt-3"
            >
              Logout
            </Button>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Button as={NextLink} href="/login" variant="flat">
                Login
              </Button>
              <Button as={NextLink} href="/register" color="primary">
                Register
              </Button>
            </div>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};