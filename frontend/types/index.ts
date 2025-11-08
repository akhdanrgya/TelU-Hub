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
  description: string;
  price:       number;
  stock:       number;
  image_url:   string; // backend ngirim 'image_url' (snake_case)
  seller:      SellerResponse;
}

export interface User {
  id:       number;
  username: string;
  email:    string;
  role:     string;
  profile_image_url?: string;
}