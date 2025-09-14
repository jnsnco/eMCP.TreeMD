import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export const Sessions: Map<string, { transport: StreamableHTTPServerTransport, bearerToken: string | undefined, routeIds: string[] }> = new Map();