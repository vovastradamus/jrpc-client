## JSON RPC 2.0 Client

Zero dependecy JSON-RPC 2.0 client. With custom data providers, batch call, work with each result of operation as promise

Providers out the box:

- **JrpcFetchProvider** - native fetch
- **JrpcAxiosProvider** - axios instance

### Example

```js
import { JrpcClient, JrpcAxiosProvider } from "jrpc2-client";
import axios from "axios";

const jrpc = new JrpcClient(
  new JrpcAxiosProvider(
    axios.create({
      baseURL: "https://example.com/jrpc",
      method: "POST",
    })
  )
);

// Single call
jrpc.call("methodName", { param1: "value" }).then((result) => null);

// Batch call
jrpcClient
  .batch(
    jrpcClient.createCall("method1", "value"),
    jrpcClient.createCall("method2", "value")
  )
  .then((results) => null);

// Also can call batch with directly work every operation
const call1 = jrpcClient.createCall("method1", "value").then((result1) => null);
const call2 = jrpcClient.createCall("method2", "value").then((result2) => null);

jrpcClient.batch(call1, call2);
```
