"use client";

import React from "react";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type DashboardSidebarProps = {
  navItems: NavItem[];
};

export const DashboardSidebar = ({ navItems }: DashboardSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 rounded-lg border bg-content1 p-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              as={NextLink}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-default-700 hover:bg-default-100"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};