import { TProviderRequestBody, TJrpcServerResponse } from "./jrpc.types";

export interface IJrpcProvider {
  send(operations: TProviderRequestBody): Promise<TJrpcServerResponse>;
}

export abstract class JrpcBaseAbstractProvider implements IJrpcProvider {
  abstract send(operations: TProviderRequestBody): Promise<TJrpcServerResponse>;
}
