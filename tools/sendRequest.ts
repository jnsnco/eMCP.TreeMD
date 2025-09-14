import { z } from "zod";
import type { Tool, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { Sessions } from "../sessions";
import { zodToString } from "../utils/zodToString";

const additionSchema = z.object({
  operation: z.enum(["add"]),
  a: z.number(),
  b: z.number(),
});

const schema = z.object({
  a: z.string(),
  b: z.string(),
});

console.log(zodToString(schema));

export const sendRequestTool = {
  name: "sendRequest",
  config: {
    description: "Make a request at the current route_id to click a button or send a request object.",
    inputSchema: {
      button_id: z.string().optional(),
      request: z.object({}).passthrough().optional().describe("The request object to call at the current route_id.")
    } as const,
  } as const,
  callback: async (args: z.ZodRawShape, rest: any) => {
    const { sessionId, requestInfo } = rest;
    const headers = requestInfo?.headers;
    const authHeader = headers?.authorization;
    const bearerToken = authHeader?.split("Bearer ")?.[1] as string | undefined;
    let request = args.request as unknown as string;

    const session = Sessions.get(sessionId)!;

    const currentRoute = session.routeIds[session.routeIds.length - 1];
    console.log("Current route: ", currentRoute);

    if (currentRoute === "do_addition") {
      const result = additionSchema.parse(request);
      console.log("Result: ", result);
    } else {
      console.log("Performing: ", currentRoute);
    }

    const success = request !== undefined;

    return await Promise.resolve({
      content: [{ type: "text", text: await (() => {
        return success ? "Request made successfully" : "Request failed";
      })() }]
    })
  },
} as ToolAnnotations;
