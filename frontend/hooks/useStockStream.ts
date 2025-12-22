"use client";
import { useState, useEffect } from "react";

import { StockServiceClient } from "@/proto-gen/StockServiceClientPb";
import { TrackStockRequest, StockUpdateResponse } from "@/proto-gen/stock_pb";

const GRPC_URL = process.env.NEXT_PUBLIC_GRPC_URL || "http://localhost:8081";

console.log("🔗 Connecting gRPC to:", GRPC_URL);

const grpcClient = new StockServiceClient(GRPC_URL, null, null);

export const useStockStream = (productId: number | null) => {
  const [liveStock, setLiveStock] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    console.log(`[gRPC-Web] Mulai 'nonton' stok ID: ${productId} via ${GRPC_URL}`);
    
    const request = new TrackStockRequest();
    request.setProductId(productId);

    const stream = grpcClient.trackStock(request, {});

    stream.on("data", (response: StockUpdateResponse) => {
      const newStock = response.getNewStock();
      console.log(`[gRPC-Web] DAPET SIARAN! Stok baru: ${newStock}`);
      setLiveStock(newStock);
    });

    stream.on("error", (err : any) => {
      console.error(`[gRPC-Web] Error stream: ${err.message}`, err);
    });

    stream.on("end", () => {
      console.log("[gRPC-Web] Siaran selesai");
    });

    return () => {
      console.log(`[gRPC-Web] Berhenti nonton ID: ${productId}`);
      stream.cancel(); 
    };

  }, [productId]);

  return liveStock;
};