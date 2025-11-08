"use client";

import React from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { FiBox, FiPlusSquare, FiDollarSign } from "react-icons/fi";

const sellerNavItems = [
  {
    label: "My Products",
    href: "/seller/dashboard",
    icon: <FiBox size={18} />,
  },
  {
    label: "Add New Product",
    href: "/seller/dashboard/new",
    icon: <FiPlusSquare size={18} />,
  },
  // {
  //   label: "My Orders",
  //   href: "/seller/dashboard/orders",
  //   icon: <FiDollarSign size={18} />,
  // },
];

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 py-8">
      <DashboardSidebar navItems={sellerNavItems} />
      <div className="flex-grow">
        {children}
      </div>

    </div>
  );
}