import { TProviderRequestBody, JrpcServerResponse } from "./jrpc.types";

export abstract class JrpcBaseAbstractProvider {
  abstract send(operations: TProviderRequestBody): Promise<JrpcServerResponse>;
}
