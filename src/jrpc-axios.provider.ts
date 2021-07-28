import { AxiosInstance } from "axios";
import { JrpcBaseAbstractProvider } from "./jrpc-base.provider";
import { TProviderRequestBody } from "./jrpc.types";

export class JrpcAxiosProvider extends JrpcBaseAbstractProvider {
  constructor(private axios: AxiosInstance) {
    super();
  }

  async send(operations: TProviderRequestBody) {
    return this.axios.request({ data: operations }).then((resp) => resp.data);
  }
}
