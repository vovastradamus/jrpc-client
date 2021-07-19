import { counter, createIdGenerator } from "./helpers";

type Unpacked<T> = T extends (infer U)[] ? U : T;

function has(obj: Object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function noop() {}

function isPlainObject(maybeObject: any): boolean {
  return (
    typeof maybeObject === "object" &&
    maybeObject !== null &&
    !Array.isArray(maybeObject)
  );
}

function toArray<T>(value: T): Unpacked<T>[] {
  // @ts-ignore
  return Array.isArray(value) ? value : [value];
}

interface IHui<T> {
  delete: Unpacked<T>;
}

type T0 = IHui<number>["delete"];

const hui = [[1, 2, 3], { test: 1 }];
const [n, g] = hui;

type OperationID = string | number;
type OperationParams = string | number | Object | Array<any> | null | undefined;

interface IOperation {
  method: string;
  params: any;
  id?: OperationID;
}

class Operation {
  private id?: OperationID;
  private method?: IOperation["method"];
  private params?: OperationParams;
  private operationPromise: Promise<any>;
  private operationResolve?: (value?: any) => void;
  private operationReject?: (error: OperationError) => void;

  private constructor() {
    this.operationPromise = new Promise((resolve, reject) => {
      this.operationResolve = resolve;
      this.operationReject = reject;
    });
  }

  static create({
    id,
    method,
    params,
  }: Partial<IOperation> & Required<Pick<IOperation, "method">>) {
    const operation = new this();

    operation.setMethod(method);
    operation.setId(id);
    operation.setParams(params);

    return operation;
  }

  get promise() {
    return this.operationPromise;
  }

  get resolve() {
    return this.operationResolve;
  }

  get reject() {
    return this.operationReject;
  }

  getId() {
    return this.id;
  }

  hasId() {
    return this.id === undefined || this.id === null;
  }

  setMethod(method: IOperation["method"]) {
    this.method = method;

    return this;
  }

  setId(id: IOperation["id"]) {
    this.id = id;

    return this;
  }

  setParams(params: IOperation["params"]) {
    this.params = params;

    return this;
  }

  toObject() {
    const operationObject: Partial<IOperation> & { jsonrpc: string } = {
      jsonrpc: "2.0",
      method: this.method,
    };

    if (this.id) {
      operationObject.id = this.id;
    }

    if (this.params !== undefined) {
      operationObject.params = this.params;
    }

    return operationObject;
  }
}

interface JrpcProviderRequestBody extends Partial<IOperation> {
  jsonrpc: string;
}

abstract class JrpcProvider {
  abstract send(operations: TProviderRequestBody): Promise<JrpcServerResponse>;
}

type TProviderRequestBody = JrpcProviderRequestBody | JrpcProviderRequestBody[];

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

class JrpcConsoleProvider extends JrpcProvider {
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

class JrpcFetchProvider extends JrpcProvider {
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

type TypeOperationError = { code: number; message: string } | string;

interface IOperationError extends Error {
  code?: number;
}

class OperationError extends Error implements IOperationError {
  public code: IOperationError["code"];
}

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

interface IJrpcResponseOperation {
  jsonrpc: string;
  //  Work with this typings later
  id?: OperationID;
  error?: TypeOperationError;
  result?: OperationParams;
}

type JrpcServerResponse =
  | IJrpcResponseOperation
  | IJrpcResponseOperation[]
  | undefined;

class JrpcClient {
  private idGenerator;
  private provider: JrpcProvider;

  constructor(provider: JrpcProvider) {
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

    // console.log({
    //   notifyPromises,
    //   methodPromises,
    // });

    return this.provider.send(requestBody).then((resp) => {
      notifyPromises.forEach((operation) => {
        const notifyResolve = operation.resolve;
        if (notifyResolve) {
          notifyResolve();
        }
      });

      if (!resp) {
        return;
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

const jrpcClient = new JrpcClient(new JrpcConsoleProvider());

// jrpcClient.call("call", 321).then(console.log);
// jrpcClient.notify("call", 123).then(console.log);
const operationNotify = jrpcClient.createNotify("call", "notify");
const operationCall1 = jrpcClient.createCall("call", "123");
const errorOperationCall = jrpcClient.createCall("error:test", "123");

// operationNotify.promise.then(console.log);
// operationCall1.promise.then(console.log);
errorOperationCall.promise.catch(console.log);

jrpcClient.batch(errorOperationCall);

// jrpcClient
//   .batch(
//     [
//       operationCall1,
//       jrpcClient.createCall("call", "321"),
//       operationNotify,
//       errorOperationCall,
//     ],
//     jrpcClient.createCall("call", "333")
//   )
//   .then(console.log);
