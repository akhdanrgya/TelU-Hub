
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/libs/api";
import { useRouter } from "next/navigation";
import { User, Cart } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;

  cart: Cart | null;
  loadingCart: boolean;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;

  updateCartQuantity: (cartItemId: number, newQuantity: number) => Promise<boolean>;
  removeCartItem: (cartItemId: number) => Promise<boolean>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingCart, setLoadingCart] = useState(false);

  const router = useRouter();

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Gagal fetch cart:", error);
      setCart(null);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await api.get("/me");
        setUser(response.data);
        setIsAuthenticated(true);

        await fetchCart();
      } catch (error) {
        console.error("Gagal ngecek status auth:", error);
        setUser(null);
        setIsAuthenticated(false);
        setCart(null);
        router.push("/login")
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      await fetchCart();
      router.push("/");
      return true;
    } catch (error) {
      console.error("Login gagal:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      setCart(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout gagal:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    if (!isAuthenticated) {
      router.push("/login");
      return false;
    }
    
    setLoadingCart(true);
    try {
      await api.post("/cart/items", {
        product_id: productId,
        quantity: quantity,
      });
      
      await fetchCart(); 
      return true;
      
    } catch (error: any) {
      console.error("Gagal nambah ke cart:", error);
      alert(error.response?.data?.error || "Gagal nambah ke keranjang");
      return false;
    } finally {
      setLoadingCart(false);
    }
  };

  const updateCartQuantity = async (cartItemId: number, newQuantity: number): Promise<boolean> => {
    if (newQuantity <= 0) {
      return removeCartItem(cartItemId);
    }
    
    setLoadingCart(true);
    try {
      await api.put(`/cart/items/${cartItemId}`, {
        quantity: newQuantity,
      });
      await fetchCart();
      return true;
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal update quantity");
      return false;
    } finally {
      setLoadingCart(false);
    }
  };

  const removeCartItem = async (cartItemId: number): Promise<boolean> => {
    setLoadingCart(true);
    try {
      await api.delete(`/cart/items/${cartItemId}`);
      await fetchCart();
      return true;
    } catch (error: any) {
      alert(error.response?.data?.error || "Gagal hapus item");
      return false;
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loading, cart, loadingCart, addToCart, updateCartQuantity, removeCartItem }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus dipake di dalem AuthProvider");
  }
  return context;
};