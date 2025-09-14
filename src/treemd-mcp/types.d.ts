declare module './tools/navigate.js' {
  export const navigateTool: {
    name: string;
    config: { description: string };
    callback: any;
  };
}

declare module './tools/sendRequest.js' {
  export const sendRequestTool: {
    name: string;
    config: { description: string };
    callback: any;
  };
}

declare module './tools/startHere.js' {
  export const startHereTool: {
    name: string;
    config: { description: string };
    callback: any;
  };
}

declare module './sessions.js' {
  export const Sessions: Map<string, {
    transport: any;
    bearerToken: string | undefined;
    routeIds: string[];
  }>;
}