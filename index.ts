import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer, type ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod";
import { navigateTool } from "./tools/navigate";
import { Sessions } from "./sessions";
import { sendRequestTool } from "./tools/sendRequest";
import { startHereTool } from "./tools/startHere";

const app = express();
app.use(express.json());

app.post('/mcp', async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  const bearerToken = req.headers?.['authorization'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  const session = Sessions.get(sessionId ?? "");
  const isExistingSession = sessionId && session;
  if (isExistingSession) {
    transport = session.transport;
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        // Store the transport by session ID
        Sessions.set(sessionId, {transport, bearerToken, routeIds: [] });
      },
      onsessionclosed(sessionId) {
        console.log("Session closed", sessionId);
        Sessions.delete(sessionId);
      },
      // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
      // locally, make sure to set:
      // enableDnsRebindingProtection: true,
      // allowedHosts: ['127.0.0.1'],
    });

    transport.onclose = () => {
      console.log("Transport closed", sessionId);
      if (sessionId && Sessions.has(sessionId)) {
        Sessions.delete(sessionId);
      }
    };
    const server = new McpServer({
      name: "example-server",
      version: "1.0.0"
    });

    server.registerTool(navigateTool.name as string, {
      description: (navigateTool.config as any).description,
      // @ts-ignore
      inputSchema: {
        route_id: z.string(),
      } as z.ZodRawShape,
    }, navigateTool.callback);

    server.registerTool(sendRequestTool.name as string, {
      description: (sendRequestTool.config as any).description,
      // @ts-ignore
      inputSchema: {
        request: z.object({}).passthrough().optional().describe("The request object for the API call."),
      } as z.ZodRawShape,
    }, sendRequestTool.callback);

    server.registerTool(startHereTool.name as string, {
      description: (startHereTool.config as any).description,
      // @ts-ignore
      inputSchema: {
        intention: z.string().describe("The intention of the user."),
      } as z.ZodRawShape,
    }, startHereTool.callback);

    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !Sessions.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = Sessions.get(sessionId)!.transport;
  await transport.handleRequest(req, res);
};

app.get('/mcp', handleSessionRequest);

app.delete('/mcp', handleSessionRequest);

app.listen(3001);

console.log("MCP server running on port 3001");