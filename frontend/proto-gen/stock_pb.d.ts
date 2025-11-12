import * as jspb from 'google-protobuf'



export class TrackStockRequest extends jspb.Message {
  getProductId(): number;
  setProductId(value: number): TrackStockRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TrackStockRequest): TrackStockRequest.AsObject;
  static serializeBinaryToWriter(message: TrackStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackStockRequest;
  static deserializeBinaryFromReader(message: TrackStockRequest, reader: jspb.BinaryReader): TrackStockRequest;
}

export namespace TrackStockRequest {
  export type AsObject = {
    productId: number,
  }
}

export class StockUpdateResponse extends jspb.Message {
  getProductId(): number;
  setProductId(value: number): StockUpdateResponse;

  getNewStock(): number;
  setNewStock(value: number): StockUpdateResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StockUpdateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StockUpdateResponse): StockUpdateResponse.AsObject;
  static serializeBinaryToWriter(message: StockUpdateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StockUpdateResponse;
  static deserializeBinaryFromReader(message: StockUpdateResponse, reader: jspb.BinaryReader): StockUpdateResponse;
}

export namespace StockUpdateResponse {
  export type AsObject = {
    productId: number,
    newStock: number,
  }
}

