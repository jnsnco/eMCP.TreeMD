import { z } from "zod";
import type { Tool, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { Sessions } from "../sessions";
import { render } from "../utils/render";

export const navigateTool = {
  name: "navigate",
  config: {
    description: "Navigate in WorkOS to a route by valid route_id. Valid Route IDs are listed in the markdown returned by the tool. Always start by navigating to route_id 'home'.",
    inputSchema: {
      route_id: z.string(),
    } as const,
  } as const,
  callback: async (args: z.ZodRawShape, rest: any) => {
    const { sessionId, requestInfo } = rest;
    const headers = requestInfo?.headers;
    const authHeader = headers?.authorization;
    const bearerToken = authHeader?.split("Bearer ")?.[1] as string | undefined;
    let routeId = args.route_id as unknown as string;

    const session = Sessions.get(sessionId)!;

    if (session) {
      console.log(session.routeIds);
      if (routeId === "back") {
        session.routeIds.pop();
        routeId = session.routeIds[session.routeIds.length - 1] ?? "home";
      } else if (routeId === "home") {
        session.routeIds = [routeId];
      } else {
        session.routeIds.push(routeId);
      }
    }

    return await Promise.resolve({
      content: [{ type: "text", text: await render(`${routeId}`, { sessionId, bearerToken, routes: session.routeIds }) }]
    })
  },
} as ToolAnnotations;
