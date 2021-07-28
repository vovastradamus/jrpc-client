import { JrpcClient, JrpcAxiosProvider } from "jrpc2-client";
import axios from "axios";

const jrpc = new JrpcClient(
  new JrpcAxiosProvider(
    axios.create({
      baseURL: "https://n7x3e.sse.codesandbox.io/jrps",
      method: "POST",
    })
  )
);

jrpc.call("test", "test1").then(console.log);
