import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

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