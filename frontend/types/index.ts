import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type NotificationType = "order" | "chat" | "info";

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  reference_id: number;
  is_read: boolean;
  created_at: string;
}

export interface SellerResponse {
  id:       number;
  username: string;
  email:    string;
}

export interface Product {
  id:          number;
  name:        string;
  slug:        string;
  description: string;
  price:       number;
  stock:       number;
  image_url:   string;
  seller:      SellerResponse;
}

export interface User {
  id:       number;
  username: string;
  email:    string;
  role:     string;
  profile_image_url?: string;
}

export interface CartItem {
  id:         number;
  product_id: number;
  quantity:   number;
  Product:    Product;
}

export interface Cart {
  id:         number;
  user_id:    number;
  CartItems:  CartItem[];
}

export interface PublicProfile {
  id:       number;
  username: string;
  role:     string;
  profile_image_url?: string;
  joined_at: string;
}

export interface OrderProduct {
  id:       number;
  name:     string;
  price:    number;
  image_url: string;
}

export interface OrderItem {
  id:           number;
  quantity:     number;
  price_at_time: number;
  Product:      OrderProduct;
}

export interface Order {
  id:           number;
  total_amount: number;
  status:       string;
  created_at:   string;
  OrderItems:   OrderItem[];
}