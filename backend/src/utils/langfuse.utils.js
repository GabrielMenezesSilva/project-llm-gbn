import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  secretKey: "sk-lf-874e47b8-af78-4761-98fb-778eecb1b746",
  publicKey: "pk-lf-b8ab56d7-60f6-4b6a-9a6e-ac900de99ca1",
  baseUrl: "http://10.42.6.179:3001",
});

langfuse.debug();

export default langfuse;
