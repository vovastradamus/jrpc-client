export type TProviderRequestBody =
  | JrpcProviderRequestBody
  | JrpcProviderRequestBody[];

export type TypeOperationError = { code: number; message: string } | string;
export type OperationID = string | number;
export type OperationParams =
  | string
  | number
  | Object
  | Array<any>
  | null
  | undefined;

export interface IOperation {
  method: string;
  params: any;
  id?: OperationID;
}
export interface JrpcProviderRequestBody extends Partial<IOperation> {
  jsonrpc: string;
}

export interface IOperationError extends Error {
  code?: number;
}
export interface IJrpcResponseOperation {
  jsonrpc: string;
  //  Work with this typings later
  id?: OperationID;
  error?: TypeOperationError;
  result?: OperationParams;
}

export type TJrpcServerResponse =
  | IJrpcResponseOperation
  | IJrpcResponseOperation[]
  | undefined
  | any;
