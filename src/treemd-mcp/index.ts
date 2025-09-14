import express from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod";
import { navigateTool } from "./tools/navigate.js";
import { Sessions } from "./sessions.js";
import { sendRequestTool } from "./tools/sendRequest.js";
import { startHereTool } from "./tools/startHere.js";

const app = express();
app.use(express.json());

app.post('/mcp', async (req: any, res: any) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  const bearerToken = req.headers?.['authorization'] as string | undefined;
  let transport: any;

  const session = Sessions.get(sessionId ?? "");
  const isExistingSession = sessionId && session;
  if (isExistingSession) {
    transport = session.transport;
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        Sessions.set(sessionId, {transport, bearerToken, routeIds: [] });
      },
      onsessionclosed(sessionId) {
        console.log("Session closed", sessionId);
        Sessions.delete(sessionId);
      },
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
      inputSchema: {
        route_id: z.string(),
      } as any,
    }, navigateTool.callback as any);

    server.registerTool(sendRequestTool.name as string, {
      description: (sendRequestTool.config as any).description,
      inputSchema: {
        request: z.object({}).passthrough().optional().describe("The request object for the API call."),
      } as any,
    }, sendRequestTool.callback as any);

    server.registerTool(startHereTool.name as string, {
      description: (startHereTool.config as any).description,
      inputSchema: {
        intention: z.string().describe("The intention of the user."),
      } as any,
    }, startHereTool.callback as any);

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

const handleSessionRequest = async (req: any, res: any) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !Sessions.has(sessionId)) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = Sessions.get(sessionId)!.transport;
  await transport.handleRequest(req, res);
};

app.get('/mcp', handleSessionRequest);

app.delete('/mcp', handleSessionRequest);

// For Raindrop deployment
export default {
  fetch: async (request: any) => {
    return new Promise((resolve) => {
      const url = new URL(request.url);

      // Create Express-compatible request object
      const req = {
        method: request.method,
        url: url.pathname,
        path: url.pathname,
        headers: Object.fromEntries(request.headers.entries()),
        body: null,
        on: (event: string, callback: Function) => {
          if (event === 'data') {
            request.text().then((text: string) => {
              req.body = text ? JSON.parse(text) : {};
              callback();
            });
          } else if (event === 'end') {
            callback();
          }
        }
      };

      // Create Express-compatible response object
      const res = {
        statusCode: 200,
        headers: {} as any,
        status: function(code: number) {
          this.statusCode = code;
          return this;
        },
        set: function(name: string, value: string) {
          this.headers[name] = value;
          return this;
        },
        json: function(data: any) {
          this.headers['Content-Type'] = 'application/json';
          resolve(new Response(JSON.stringify(data), {
            status: this.statusCode,
            headers: this.headers
          }));
        },
        send: function(data: any) {
          resolve(new Response(data, {
            status: this.statusCode,
            headers: this.headers
          }));
        },
        end: function() {
          resolve(new Response(null, {
            status: this.statusCode,
            headers: this.headers
          }));
        }
      };

      // Handle the request through Express
      (app as any).handle(req, res);
    });
  }
};