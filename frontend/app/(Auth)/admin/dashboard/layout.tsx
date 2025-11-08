"use client";

import React from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { FiUsers, FiBox } from "react-icons/fi";

const adminNavItems = [
  {
    label: "Manage Users",
    href: "/admin/dashboard",
    icon: <FiUsers size={18} />,
  },
  {
    label: "Manage Products",
    href: "/admin/dashboard/products",
    icon: <FiBox size={18} />,
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 py-8">
      <DashboardSidebar navItems={adminNavItems} />
      <div className="flex-grow">
        {children}
      </div>

    </div>
  );
}