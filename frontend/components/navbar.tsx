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

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { FiShoppingCart, FiUser } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, user, logout, loading, cart } = useAuth();

  const totalCartItems = cart?.CartItems
    ? cart.CartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* ... (Navbar Kiri lo udah bener) ... */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>

        {loading ? (
          <NavbarItem className="hidden md:flex">
            <p className="text-default-500">Loading...</p>
          </NavbarItem>
        ) : isAuthenticated ? (
          <>
            <NavbarItem className="hidden md:flex">
              <div className="flex items-center gap-4">
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
                    aria-label="Cart Popup"
                    variant="flat"
                    className="min-w-[350px]"
                  >
                    <DropdownItem
                      key="header"
                      isReadOnly
                      className="font-bold text-lg"
                    >
                      Keranjang Saya ({totalCartItems} item)
                    </DropdownItem>

                    {cart?.CartItems && cart.CartItems.length > 0 ? (
                      <>
                        {cart.CartItems.map((item) => (
                          <DropdownItem
                            key={item.id}
                            as={NextLink}
                            href={`/products/${item.Product.slug}`}
                            className="h-auto py-2"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={item.Product.image_url}
                                name={item.Product.name ? item.Product.name.charAt(0) : '?'}
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
                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-primary">
                                  Rp{" "}
                                  {(
                                    item.quantity * item.Product.price
                                  ).toLocaleString("id-ID")}
                                </p>
                                <p className="text-xs text-default-500">
                                  @ Rp{" "}
                                  {item.Product.price.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          </DropdownItem>
                        ))}
                      </>
                    ) : (
                      <DropdownItem
                        key="empty"
                        isReadOnly
                        className="text-center text-default-500 py-4"
                      >
                        Keranjang mu kosong
                      </DropdownItem>
                    )}

                    {cart?.CartItems && cart.CartItems.length > 0 ? (
                      <DropdownItem key="footer" className="p-0 mt-2">
                        <Button
                          as={NextLink}
                          href="/cart"
                          color="primary"
                          className="w-full"
                          radius="none"
                        >
                          Lihat Keranjang & Checkout
                        </Button>
                      </DropdownItem>
                    ) : null}
                  </DropdownMenu>
                </Dropdown>

                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="primary"
                      size="sm"
                      src={user?.profile_image_url}
                      name={user?.username.charAt(0).toUpperCase()}
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    {/* ... (Semua DropdownItem profil lo udah bener pake ? : null) ... */}
                    <DropdownItem
                      key="profile-info"
                      className="h-14 gap-2"
                      isReadOnly
                    >
                      <p className="font-semibold">Signed in as</p>
                      <p className="font-semibold">{user?.email}</p>
                    </DropdownItem>
                    <DropdownItem key="profile" as={NextLink} href="/profile">
                      Profil Saya
                    </DropdownItem>
                    <DropdownItem key="orders" as={NextLink} href="/orders">
                      Pesanan Saya
                    </DropdownItem>
                    {user?.role === "seller" || user?.role === "admin" ? (
                      <DropdownItem
                        key="seller-dashboard"
                        as={NextLink}
                        href="/seller/dashboard"
                        className="text-primary"
                        color="primary"
                      >
                        Seller Dashboard
                      </DropdownItem>
                    ) : null}
                    {user?.role === "admin" ? (
                      <DropdownItem
                        key="admin-dashboard"
                        as={NextLink}
                        href="/admin/dashboard"
                        className="text-secondary"
                        color="secondary"
                      >
                        Admin Dashboard
                      </DropdownItem>
                    ) : null}
                    <DropdownItem key="logout" color="danger" onPress={logout}>
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem className="hidden md:flex gap-2">
            {/* ... (Tombol Login/Register lo udah bener) ... */}
            <Button
              as={NextLink}
              href="/login"
              variant="ghost"
              startContent={<FiUser size={18} />}
            >
              Login
            </Button>
            <Button
              as={NextLink}
              href="/register"
              variant="flat"
              color="primary"
            >
              Register
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NextLink href="/cart">
          <Badge
            content={totalCartItems}
            color="danger"
            isInvisible={totalCartItems === 0}
          >
            <FiShoppingCart size={20} />
          </Badge>
        </NextLink>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {/* ... (Menu Mobile lo udah bener) ... */}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === siteConfig.navMenuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
        {isAuthenticated && (
          <NavbarMenuItem>
            <Button
              onPress={logout}
              color="danger"
              variant="flat"
              className="w-full"
            >
              Logout
            </Button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
