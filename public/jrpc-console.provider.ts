import { JrpcBaseAbstractProvider } from "../src/jrpc-base.provider";
import {
  JrpcProviderRequestBody,
  TProviderRequestBody,
} from "../src/jrpc.types";

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
    // @ts-ignore
    return Promise.resolve(null);

    // if (Array.isArray(operations)) {
    //   return Promise.resolve(
    //     operations.map(convertRequestOPerationToResponse).filter((v) => v.id)
    //   );
    // }

    // const resp = convertRequestOPerationToResponse(operations);

    // if (!resp.id) {
    //   return Promise.resolve(undefined);
    // }

    // return Promise.resolve(resp);
  }
}
