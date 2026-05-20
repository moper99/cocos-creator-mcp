import express from 'express';
import { CocosMCPServer } from './mcp-server';
import { Server } from 'http';

const app = express();
app.use(express.json({ limit: '1mb' }));

let serverInstance: Server | null = null;

/**
 * 根路径端点
 */
app.get('/', (req, res) => {
  res.send('Cocos MCP Server is running in Stateless HTTP mode. Use POST /mcp for MCP requests.');
});

/**
 * Streamable HTTP / Stateless MCP 端点
 * 所有的 MCP 请求（tools/list, tools/call 等）直接发送到此端点
 */
app.post('/mcp', async (req, res) => {
  const request = req.body;
  
  if (!request || !request.method) {
    res.status(400).json({
      jsonrpc: '2.0',
      id: request?.id || null,
      error: { code: -32600, message: 'Invalid Request: Missing method' }
    });
    return;
  }

  try {
    const mcpServer = CocosMCPServer.getInstance();
    let result;
    
    if (request.method === 'tools/list') {
      result = {
        jsonrpc: '2.0',
        id: request.id,
        result: { tools: (mcpServer as any).tools }
      };
    } else if (request.method === 'tools/call') {
      const { name, arguments: args } = request.params || {};
      if (!name) {
        throw new Error('Missing tool name in params');
      }
      
      try {
        const toolResult = await (mcpServer as any).executeTool(name, args || {});
        result = {
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(toolResult) }]
          }
        };
      } catch (error: any) {
        result = {
          jsonrpc: '2.0',
          id: request.id,
          error: { code: -32603, message: error.message }
        };
      }
    } else if (request.method === 'initialize') {
       result = {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'cocos-mcp-server', version: '1.0.0' }
        }
      };
    } else {
      result = {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32601, message: 'Method not found' }
      };
    }

    res.json(result);
  } catch (error: any) {
    console.error('[Cocos MCP Server] Error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: request.id,
      error: { code: -32603, message: error.message }
    });
  }
});

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'cocos-mcp-server' });
});

/**
 * 获取服务器状态
 */
app.get('/status', (req, res) => {
  res.json({
    running: true,
    port: 3000,
    mode: 'Stateless HTTP'
  });
});

/**
 * 启动 HTTP 服务器
 */
export function startHttpServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    serverInstance = app.listen(port, '127.0.0.1', () => {
      console.log(`[Cocos MCP Server] HTTP Server running on http://127.0.0.1:${port}/mcp`);
      resolve();
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Cocos MCP Server] Port ${port} in use`);
      }
      reject(err);
    });
  });
}

/**
 * 停止 HTTP 服务器
 */
export function stopHttpServer(): Promise<void> {
  return new Promise((resolve) => {
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('[Cocos MCP Server] HTTP Server stopped.');
        serverInstance = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}
