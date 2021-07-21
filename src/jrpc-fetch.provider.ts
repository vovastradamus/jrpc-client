import { JrpcProvider } from "./jrpc-base.provider";
import { TProviderRequestBody } from "./jrpc.types";

export class JrpcFetchProvider extends JrpcProvider {
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
