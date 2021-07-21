import { JrpcBaseAbstractProvider } from "./jrpc-base.provider";
import { JrpcProviderRequestBody, TProviderRequestBody } from "./jrpc.types";

function convertRequestOPerationToResponse(operation: JrpcProviderRequestBody) {
  if (operation.method?.indexOf("error") === 0) {
    return {
      jsonrpc: operation.jsonrpc,
      id: operation.id,
      error: {
        code: -123123,
        message: "hui",
      },
    };
  }

  return {
    jsonrpc: operation.jsonrpc,
    id: operation.id,
    result: operation.params,
  };
}

export class JrpcConsoleProvider extends JrpcBaseAbstractProvider {
  send(operations: TProviderRequestBody) {
    if (Array.isArray(operations)) {
      return Promise.resolve(
        operations.map(convertRequestOPerationToResponse).filter((v) => v.id)
      );
    }

    const resp = convertRequestOPerationToResponse(operations);

    if (!resp.id) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve(resp);
  }
}
