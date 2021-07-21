import { JrpcBaseAbstractProvider } from "./jrpc-base.provider";
import { TProviderRequestBody } from "./jrpc.types";

export class JrpcFetchProvider extends JrpcBaseAbstractProvider {
  constructor(private baseUrl: string) {
    super();
  }

  async send(operations: TProviderRequestBody) {
    const request = await fetch(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(operations),
    });

    return request.json();
  }
}
