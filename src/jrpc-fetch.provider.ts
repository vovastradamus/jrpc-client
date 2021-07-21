import { JrpcBaseAbstractProvider } from "./jrpc-base.provider";
import { TProviderRequestBody } from "./jrpc.types";

export class JrpcFetchProvider extends JrpcBaseAbstractProvider {
  private baseUrl: string;
  private configMerge?: (config: RequestInit) => RequestInit;

  constructor({
    baseUrl,
    configMerge,
  }: {
    baseUrl: string;
    configMerge: <T>(config: T) => T;
  }) {
    super();

    this.baseUrl = baseUrl;
    this.configMerge = configMerge;
  }

  async send(operations: TProviderRequestBody) {
    const requestInit: RequestInit = {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      redirect: "follow",
      referrerPolicy: "no-referrer",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const request = await fetch(
      this.baseUrl,
      Object.assign(
        this.configMerge ? this.configMerge(requestInit) : requestInit,
        {
          body: JSON.stringify(operations),
        }
      )
    );

    return request.json();
  }
}
