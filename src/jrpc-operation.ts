import {
  OperationID,
  IOperation,
  OperationParams,
  IOperationError,
} from "./jrpc.types";

export class OperationError extends Error implements IOperationError {
  public code: IOperationError["code"];
}

export class Operation {
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
