import { TProviderRequestBody, JrpcServerResponse } from "./jrpc.types";

export abstract class JrpcProvider {
  abstract send(operations: TProviderRequestBody): Promise<JrpcServerResponse>;
}
