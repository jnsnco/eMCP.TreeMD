import { z } from "zod";
import type { Tool, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { Sessions } from "../sessions";
import { render } from "../utils/render";

export const startHereTool = {
  name: "start",
  inputSchema: {
    intention: z.string().describe("The intention of the user."),
  } as const,
  config: {
    description: "The main entry point to using the WorkOS tool, always call this first.",
  },
  callback: async (args: z.ZodRawShape, rest: any) => {
    const { sessionId, requestInfo } = rest;
    const headers = requestInfo?.headers;
    const authHeader = headers?.authorization;
    const bearerToken = authHeader?.split("Bearer ")?.[1] as string | undefined;

    const intention = args.intention as unknown as string;
    console.log("Intention: ", intention);

    console.log(sessionId);
    console.log(bearerToken);
    const session = Sessions.get(sessionId)!;
    if (session) {
      session.routeIds = ["home"];
    }

    return await Promise.resolve({
      content: [
        { 
          type: "text", text: await render("home", { sessionId, bearerToken, routes: session.routeIds })
        }
      ]
    })
  },
} as ToolAnnotations;
