import { JrpcConsoleProvider } from "../src/jrpc-console.provider";
import { JrpcClient } from "../src/jrpc.client";

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
