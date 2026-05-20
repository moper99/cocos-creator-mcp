import { startHttpServer, stopHttpServer } from './http-server';
import { CocosMCPServer } from './mcp-server';

let mcpServer: CocosMCPServer | null = null;

export const methods: { [key: string]: (...any: any) => any } = {
  openPanel() {
    Editor.Panel.open('cocos-mcp-server');
  },
  async startServer() {
    if (mcpServer) {
      await mcpServer.start();
    }
  },
  async stopServer() {
    if (mcpServer) {
      mcpServer.stop();
    }
  }
};

export function load() {
  console.log('[Cocos MCP Server] Extension loading...');
  try {
    mcpServer = CocosMCPServer.getInstance();
    startHttpServer(3000).then(() => {
      console.log('[Cocos MCP Server] Started on port 3000');
    }).catch(err => {
      console.error('[Cocos MCP Server] Failed to start HTTP server:', err.message);
    });
  } catch (err: any) {
    console.error('[Cocos MCP Server] Load failed:', err.message);
  }
}

export function unload() {
  console.log('[Cocos MCP Server] Extension unloading...');
  if (mcpServer) {
    mcpServer.stop();
    mcpServer = null;
    CocosMCPServer.resetInstance();
  }
  stopHttpServer().catch(() => {});
}
