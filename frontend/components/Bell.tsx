"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { FiBell, FiShoppingBag, FiMessageSquare, FiInfo } from "react-icons/fi";
import clsx from "clsx";
import NextLink from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { useNotifications } from "@/hooks/useNotifications";
import { Notification, NotificationType } from "@/types";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "order":
      return <FiShoppingBag className="text-primary" size={20} />;
    case "chat":
      return <FiMessageSquare className="text-success" size={20} />;
    case "info":
    default:
      return <FiInfo className="text-default-500" size={20} />;
  }
};

const getNotificationLink = (notif: Notification) => {
  switch (notif.type) {
    case "order":
      return `/orders/${notif.reference_id}`;
    case "chat":
      return `/chat/${notif.reference_id}`;
    case "info":
    default:
      return "#";
  }
};

export const NotificationBell = () => {
  const { notifications, unreadCount, loading, markAsRead, isConnected } =
    useNotifications();

  const handleItemClick = React.useCallback(
    (notif: Notification) => {
      if (!notif.is_read) {
        markAsRead(notif.id);
      }
    },
    [markAsRead]
  );

  const notificationItems = React.useMemo(() => {
    if (loading && notifications.length === 0) {
      return (
        <>
          <DropdownItem key="loading" isReadOnly className="flex justify-center">
            <Spinner size="sm" />
          </DropdownItem>
        </>
      );
    }

    if (notifications.length === 0) {
      return (
        <>
          <DropdownItem
            key="empty"
            isReadOnly
            className="text-center text-default-500 py-4"
          >
            Tidak ada notifikasi baru
          </DropdownItem>
        </>
      );
    }

    const items = notifications.map((notif) => (
      <DropdownItem
        key={notif.id}
        as={NextLink}
        href={getNotificationLink(notif)}
        className={clsx(
          "py-3 border-b border-default-100 items-start",
          !notif.is_read ? "bg-primary-50/50 dark:bg-primary-900/20" : ""
        )}
        onPress={() => handleItemClick(notif)}
      >
        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            {getNotificationIcon(notif.type)}
          </div>
          <div className="flex-grow">
            <p
              className={clsx(
                "font-semibold",
                !notif.is_read && "text-primary"
              )}
            >
              {notif.title}
            </p>
            <p className="text-sm text-default-600 line-clamp-2">
              {notif.message}
            </p>
            <p className="text-xs text-default-400 mt-1">
              {formatDistanceToNow(new Date(notif.created_at), {
                addSuffix: true,
                locale: idLocale,
              })}
            </p>
          </div>
          {!notif.is_read && (
            <div className="flex-shrink-0 self-center">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
          )}
        </div>
      </DropdownItem>
    ));

    return (
      <>
        {items}
        <DropdownItem
          key="footer"
          className="text-center text-primary font-semibold cursor-pointer p-2"
        >
          Lihat Semua Notifikasi
        </DropdownItem>
      </>
    );
  }, [loading, notifications, handleItemClick]);

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          isIconOnly
          title={isConnected ? "Notifikasi (Online)" : "Notifikasi (Offline)"}
        >
          <Badge
            content={unreadCount}
            color="danger"
            shape="circle"
            isInvisible={unreadCount === 0}
          >
            <FiBell size={22} className={clsx(!isConnected && "opacity-50")} />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notifikasi"
        variant="flat"
        className="w-80 sm:w-96 max-h-[500px] overflow-y-auto"
        itemClasses={{
          base: "gap-4",
        }}
      >
        <DropdownItem
          key="header"
          isReadOnly
          className="font-bold text-lg cursor-default"
        >
          Notifikasi
          {!isConnected && (
            <span className="text-xs font-normal text-danger ml-2">
              (Offline)
            </span>
          )}
        </DropdownItem>
        {notificationItems}
      </DropdownMenu>
    </Dropdown>
  );
};