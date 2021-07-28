import {
  createIdGenerator,
  has,
  isPlainObject,
  noop,
  toArray,
} from "./helpers";
import { IJrpcProvider } from "./jrpc-base.provider";
import {
  createOpertaionError,
  Operation,
  OperationError,
} from "./jrpc-operation";
import {
  TypeOperationError,
  IJrpcResponseOperation,
  OperationID,
  OperationParams,
} from "./jrpc.types";

function castOperationerrorToError(error: TypeOperationError): OperationError {
  if (typeof error === "string") {
    return new OperationError(error);
  }
  if (isPlainObject(error)) {
    const err = new OperationError(error.message);
    err.code = error.code;
    return err;
  }

  return new OperationError("Operation Error");
}

function createReturnByResp(resp: IJrpcResponseOperation) {
  if (has(resp, "error") && resp.error) {
    return castOperationerrorToError(resp.error);
  }
  return resp.result;
}

export class JrpcClient {
  private idGenerator;
  private provider: IJrpcProvider;

  constructor(provider: IJrpcProvider) {
    this.idGenerator = createIdGenerator();
    this.provider = provider;
  }

  private sendRequest(operations: Operation | Operation[]) {
    const isBatch = Array.isArray(operations);
    const requestBody = Array.isArray(operations)
      ? operations.map((o) => o.toObject())
      : operations.toObject();

    const [notifyPromises, methodPromises] = toArray(operations).reduce(
      (acc, operation) => {
        const operationId = operation.getId();
        if (operationId) {
          acc[1][operationId] = operation;
        } else {
          acc[0].push(operation);
        }
        // Ignore rejected promise
        operation.promise.catch(noop);
        return acc;
      },
      [[], {}] as [Array<Operation>, Record<OperationID, Operation>]
    );

    return this.provider.send(requestBody).then((resp) => {
      notifyPromises.forEach((operation) => {
        const notifyResolve = operation.resolve;
        if (notifyResolve) {
          notifyResolve();
        }
      });

      if (!resp) {
        return Promise.reject(createOpertaionError("Invalid Response", -32000));
      }

      if (!isPlainObject(resp) && !Array.isArray(resp)) {
        return Promise.reject(createOpertaionError("Invalid Response", -32000));
      }

      toArray(resp).forEach((respItem) => {
        if (!respItem.id) {
          return;
        }
        const operation = methodPromises[respItem.id];

        if (respItem.error) {
          operation.reject &&
            operation.reject(castOperationerrorToError(respItem.error));
        } else {
          operation.resolve && operation.resolve(respItem.result);
        }
      });

      if (!isBatch && !Array.isArray(resp)) {
        if (has(resp, "error") && resp.error) {
          return Promise.reject(castOperationerrorToError(resp.error));
        }
        return resp.result;
      }

      return Array.isArray(resp)
        ? resp.map(createReturnByResp)
        : createReturnByResp(resp);
    });
  }

  call(method: string, params: OperationParams) {
    const operation = Operation.create({
      method,
      id: this.idGenerator(),
      params,
    });

    return this.sendRequest(operation);
  }

  notify(method: string, params: OperationParams) {
    const operation = Operation.create({
      method,
      params,
    });

    return this.sendRequest(operation);
  }

  createCall(method: string, params: OperationParams) {
    return Operation.create({
      method,
      id: this.idGenerator(),
      params,
    });
  }

  createNotify(method: string, params: OperationParams) {
    return Operation.create({
      method,
      params,
    });
  }

  batch(operations: Operation[] | Operation, ...respOperations: Operation[]) {
    return this.sendRequest(toArray(operations).concat(respOperations));
  }
}
