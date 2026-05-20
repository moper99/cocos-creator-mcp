import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * 高级增强工具注册
 */
export function registerAdvancedTools(): Tool[] {
  return [
    {
      name: 'analyze_scene_performance',
      description: '分析当前场景的性能瓶颈（如 DrawCall 过高、过大资源等）',
      inputSchema: {
        type: 'object',
        properties: {
          depth: { 
            type: 'string', 
            enum: ['quick', 'detailed'], 
            description: '分析深度' 
          }
        }
      }
    },
    {
      name: 'batch_rename_nodes',
      description: '根据正则模式批量重命名选中的节点',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: '匹配模式' },
          replacement: { type: 'string', description: '替换文本' }
        },
        required: ['pattern', 'replacement']
      }
    },
    {
      name: 'auto_align_nodes',
      description: '将选中的节点按照指定轴向自动对齐',
      inputSchema: {
        type: 'object',
        properties: {
          axis: { type: 'string', enum: ['x', 'y', 'z'], description: '对齐轴向' },
          alignType: { type: 'string', enum: ['left', 'center', 'right'], description: '对齐方式' }
        },
        required: ['axis', 'alignType']
      }
    }
  ];
}
