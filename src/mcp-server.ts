import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { registerSceneTools } from './tools/scene-tools';
import { registerCodeTools } from './tools/code-tools';
import { registerAssetTools } from './tools/asset-tools';
import { registerPrefabTools } from './tools/prefab-tools';
import { registerComponentTools } from './tools/component-tools';
import { registerDebugTools } from './tools/debug-tools';
import { registerProjectTools } from './tools/project-tools';
import { registerGameTools } from './tools/game-tools';
import { registerAdvancedTools } from './tools/advanced-tools';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

interface ServerConfig {
  [key: string]: any;
}

type ToolArgs = Record<string, unknown>;

export class CocosMCPServer {
  private static instance: CocosMCPServer;
  private server: Server;
  public tools: Tool[] = [];
  private config: ServerConfig = {};

  private constructor() {
    this.server = new Server(
      { name: 'cocos-mcp-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.registerTools();
  }

  public static getInstance(): CocosMCPServer {
    if (!CocosMCPServer.instance) {
      CocosMCPServer.instance = new CocosMCPServer();
    }
    return CocosMCPServer.instance;
  }

  public static resetInstance(): void {
    CocosMCPServer.instance = null as any;
  }

  private registerTools() {
    this.tools.push(...registerSceneTools(), ...registerCodeTools(), ...registerAssetTools(), ...registerPrefabTools(), ...registerComponentTools(), ...registerDebugTools(), ...registerProjectTools(), ...registerGameTools(), ...registerAdvancedTools());
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: this.tools }));
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        const result = await this.executeTool(name, args || {});
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }], isError: true };
      }
    });
  }

  public async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const toolMap: Record<string, (a: ToolArgs) => Promise<unknown>> = {
      // Scene Tools
      'get_current_scene': (a) => this.sendEditorMessage('scene-get-current', a),
      'open_scene': (a) => this.sendEditorMessage('scene-open', a),
      'save_scene': (a) => this.sendEditorMessage('scene-save', a),
      'create_scene': (a) => this.sendEditorMessage('scene-create', a),
      'create_node': (a) => this.sendEditorMessage('scene-node-create', a),
      'delete_node': (a) => this.sendEditorMessage('scene-node-delete', a),
      'find_nodes': (a) => this.sendEditorMessage('scene-node-find', a),
      'get_node': (a) => this.sendEditorMessage('scene-node-get', a),
      'set_node_property': (a) => this.sendEditorMessage('scene-node-set-property', a),
      'move_node': (a) => this.sendEditorMessage('scene-node-move', a),
      'clone_node': (a) => this.sendEditorMessage('scene-node-clone', a),
      'refresh_scene_view': (a) => this.sendEditorMessage('scene-refresh-view', a),
      'select_node': (a) => this.sendEditorMessage('scene-node-select', a),
      'focus_node': (a) => this.sendEditorMessage('scene-node-focus', a),

      // Code Tools
      'create_script': (a) => this.sendEditorMessage('code-script-create', a),
      'generate_component': (a) => this.sendEditorMessage('code-component-generate', a),
      'generate_ui_component': (a) => this.sendEditorMessage('code-ui-generate', a),
      'attach_script': (a) => this.sendEditorMessage('code-script-attach', a),
      'detach_script': (a) => this.sendEditorMessage('code-script-detach', a),
      'edit_script': (a) => this.sendEditorMessage('code-script-edit', a),
      'append_to_script': (a) => this.sendEditorMessage('code-script-append', a),
      'replace_in_script': (a) => this.sendEditorMessage('code-script-replace', a),
      'get_script': (a) => this.sendEditorMessage('code-script-get', a),
      'list_scripts': (a) => this.sendEditorMessage('code-script-list', a),
      'find_script': (a) => this.sendEditorMessage('code-script-find', a),
      'get_script_methods': (a) => this.sendEditorMessage('code-script-methods', a),
      'generate_getter_setter': (a) => this.sendEditorMessage('code-script-gen-gs', a),
      'generate_event_handler': (a) => this.sendEditorMessage('code-script-gen-eh', a),
      'fix_script_errors': (a) => this.sendEditorMessage('code-script-fix', a),

      // Asset Tools
      'list_assets': (a) => this.sendEditorMessage('asset-list', a),
      'list_textures': (a) => this.sendEditorMessage('asset-list-textures', a),
      'list_scenes': (a) => this.sendEditorMessage('asset-list-scenes', a),
      'list_prefabs': (a) => this.sendEditorMessage('asset-list-prefabs', a),
      'list_audio': (a) => this.sendEditorMessage('asset-list-audio', a),
      'import_assets': (a) => this.sendEditorMessage('asset-import', a),
      'delete_asset': (a) => this.sendEditorMessage('asset-delete', a),
      'move_asset': (a) => this.sendEditorMessage('asset-move', a),
      'copy_asset': (a) => this.sendEditorMessage('asset-copy', a),
      'rename_asset': (a) => this.sendEditorMessage('asset-rename', a),
      'get_asset_info': (a) => this.sendEditorMessage('asset-get-info', a),
      'get_asset_dependencies': (a) => this.sendEditorMessage('asset-get-deps', a),
      'find_asset_by_name': (a) => this.sendEditorMessage('asset-find-name', a),
      'find_assets_by_uuid': (a) => this.sendEditorMessage('asset-find-uuid', a),
      'create_folder': (a) => this.sendEditorMessage('asset-create-folder', a),
      'create_empty_scene': (a) => this.sendEditorMessage('asset-create-scene', a),
      'create_empty_prefab': (a) => this.sendEditorMessage('asset-create-prefab', a),
      'refresh_assets': (a) => this.sendEditorMessage('asset-refresh', a),
      'reimport_asset': (a) => this.sendEditorMessage('asset-reimport', a),
      'reimport_folder': (a) => this.sendEditorMessage('asset-reimport-folder', a),
      'analyze_asset_usage': (a) => this.sendEditorMessage('asset-analyze-usage', a),
      'find_unused_assets': (a) => this.sendEditorMessage('asset-find-unused', a),
      'get_project_assets_summary': (a) => this.sendEditorMessage('asset-get-summary', a),
      'get_asset_url': (a) => this.sendEditorMessage('asset-get-url', a),
      'get_asset_uuid': (a) => this.sendEditorMessage('asset-get-uuid', a),

      // Component Tools
      'list_component_types': (a) => this.sendEditorMessage('component-list-types', a),
      'get_component_schema': (a) => this.sendEditorMessage('component-get-schema', a),
      'add_component': (a) => this.sendEditorMessage('component-add', a),
      'add_multiple_components': (a) => this.sendEditorMessage('component-add-multiple', a),
      'remove_component': (a) => this.sendEditorMessage('component-remove', a),
      'remove_all_components': (a) => this.sendEditorMessage('component-remove-all', a),
      'get_components': (a) => this.sendEditorMessage('component-get-list', a),
      'get_component': (a) => this.sendEditorMessage('component-get', a),
      'has_component': (a) => this.sendEditorMessage('component-has', a),
      'set_component_property': (a) => this.sendEditorMessage('component-set-property', a),
      'set_component_properties': (a) => this.sendEditorMessage('component-set-properties', a),
      'get_component_property': (a) => this.sendEditorMessage('component-get-property', a),
      'set_sprite_sprite': (a) => this.sendEditorMessage('component-sprite-set-sprite', a),
      'set_sprite_color': (a) => this.sendEditorMessage('component-sprite-set-color', a),
      'set_label_text': (a) => this.sendEditorMessage('component-label-set-text', a),
      'set_label_font_size': (a) => this.sendEditorMessage('component-label-set-font-size', a),
      'setup_button': (a) => this.sendEditorMessage('component-button-setup', a),
      'set_rich_text': (a) => this.sendEditorMessage('component-richtext-set-text', a),
      'set_progress_bar': (a) => this.sendEditorMessage('component-progress-set-value', a),
      'setup_slider': (a) => this.sendEditorMessage('component-slider-setup', a),
      'setup_toggle': (a) => this.sendEditorMessage('component-toggle-setup', a),
      'play_animation': (a) => this.sendEditorMessage('component-anim-play', a),
      'stop_animation': (a) => this.sendEditorMessage('component-anim-stop', a),
      'set_spine_skeleton': (a) => this.sendEditorMessage('component-spine-set-skeleton', a),
      'set_particle': (a) => this.sendEditorMessage('component-particle-set', a),

      // Debug Tools
      'get_console_logs': (a) => this.sendEditorMessage('debug-get-logs', a),
      'clear_console': (a) => this.sendEditorMessage('debug-clear-console', a),
      'get_error_logs': (a) => this.sendEditorMessage('debug-get-errors', a),
      'read_project_log': (a) => this.sendEditorMessage('debug-read-log', a),
      'search_log': (a) => this.sendEditorMessage('debug-search-log', a),
      'get_editor_info': async (a) => {
        try {
          const result: any = {
            editorExists: typeof Editor !== 'undefined',
            version: (Editor as any)?.version || 'unknown',
            topLevel: typeof Editor !== 'undefined' ? Object.getOwnPropertyNames(Editor) : [],
          };

          // 测试消息通信是否可用
          if (typeof Editor !== 'undefined' && Editor.Message) {
            result.messageAvailable = true;
            try {
              const tree = await Editor.Message.request('scene', 'query-node-tree');
              result.sceneQueryAvailable = !!tree;
              result.sceneName = tree?.name;
              result.sceneUuid = tree?.uuid;
            } catch (e: any) {
              result.sceneQueryAvailable = false;
              result.sceneQueryError = e.message;
            }
            try {
              const assets = await Editor.Message.request('asset-db', 'query-assets', {
                pattern: 'db://assets/**/*.scene'
              });
              result.assetQueryAvailable = true;
              result.assetCount = Array.isArray(assets) ? assets.length : 0;
            } catch (e: any) {
              result.assetQueryAvailable = false;
              result.assetQueryError = e.message;
            }
          } else {
            result.messageAvailable = false;
          }

          return { success: true, data: result };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      },
      'get_app_info': (a) => this.sendEditorMessage('debug-get-app-info', a),
      'get_performance_stats': (a) => this.sendEditorMessage('debug-get-perf', a),
      'get_memory_usage': (a) => this.sendEditorMessage('debug-get-memory', a),
      'get_fps': (a) => this.sendEditorMessage('debug-get-fps', a),
      'start_profiling': (a) => this.sendEditorMessage('debug-profiling-start', a),
      'stop_profiling': (a) => this.sendEditorMessage('debug-profiling-stop', a),
      'validate_scene': (a) => this.sendEditorMessage('debug-validate-scene', a),
      'debug_node_tree': (a) => this.sendEditorMessage('debug-node-tree', a),
      'get_last_error': (a) => this.sendEditorMessage('debug-get-last-error', a),
      'analyze_error': (a) => this.sendEditorMessage('debug-analyze-error', a),
      'execute_js': (a) => this.sendEditorMessage('debug-execute-js', a),
      'open_devtools': (a) => this.sendEditorMessage('debug-open-devtools', a),
      'reload_preview': (a) => this.sendEditorMessage('debug-reload-preview', a),

      // Game Tools
      'create_game_project': (a) => this.sendEditorMessage('game-create-project', a),
      'init_game_scene': (a) => this.sendEditorMessage('game-init-scene', a),
      'create_game_objects': (a) => this.sendEditorMessage('game-create-objects', a),
      'create_player': (a) => this.sendEditorMessage('game-create-player', a),
      'create_enemy': (a) => this.sendEditorMessage('game-create-enemy', a),
      'create_game_manager': (a) => this.sendEditorMessage('game-create-manager', a),
      'create_score_system': (a) => this.sendEditorMessage('game-create-score-system', a),
      'create_level_system': (a) => this.sendEditorMessage('game-create-level-system', a),
      'create_game_ui': (a) => this.sendEditorMessage('game-create-ui', a),
      'setup_camera': (a) => this.sendEditorMessage('game-setup-camera', a),
      'create_animation_controller': (a) => this.sendEditorMessage('game-create-anim-controller', a),
      'setup_animation_events': (a) => this.sendEditorMessage('game-setup-anim-events', a),
      'create_particle_system': (a) => this.sendEditorMessage('game-create-particles', a),
      'setup_effects': (a) => this.sendEditorMessage('game-setup-effects', a),
      'setup_physics': (a) => this.sendEditorMessage('game-setup-physics', a),
      'setup_collision': (a) => this.sendEditorMessage('game-setup-collision', a),
      'setup_audio': (a) => this.sendEditorMessage('game-setup-audio', a),
      'create_audio_manager': (a) => this.sendEditorMessage('game-create-audio-manager', a),
      'setup_game_config': (a) => this.sendEditorMessage('game-setup-config', a),
      'export_game_config': (a) => this.sendEditorMessage('game-export-config', a),
      'check_project': (a) => this.sendEditorMessage('game-check-project', a),
      'build_and_test': (a) => this.sendEditorMessage('game-build-test', a),

      // Prefab Tools
      'create_prefab': (a) => this.sendEditorMessage('prefab-create', a),
      'create_prefab_from_template': (a) => this.sendEditorMessage('prefab-create-template', a),
      'instantiate_prefab': (a) => this.sendEditorMessage('prefab-instantiate', a),
      'instantiate_multiple_prefab': (a) => this.sendEditorMessage('prefab-instantiate-multiple', a),
      'prefab_save': (a) => this.sendEditorMessage('prefab-save', a),
      'prefab_revert': (a) => this.sendEditorMessage('prefab-revert', a),
      'prefab_apply': (a) => this.sendEditorMessage('prefab-apply', a),
      'prefab_unlink': (a) => this.sendEditorMessage('prefab-unlink', a),
      'get_prefab_info': (a) => this.sendEditorMessage('prefab-get-info', a),
      'find_prefab_by_node': (a) => this.sendEditorMessage('prefab-find-node', a),
      'get_prefab_instances': (a) => this.sendEditorMessage('prefab-get-instances', a),
      'delete_prefab': (a) => this.sendEditorMessage('prefab-delete', a),

      // Project Tools
      'get_project_info': (a) => this.sendEditorMessage('project-get-info', a),
      'get_project_settings': (a) => this.sendEditorMessage('project-get-settings', a),
      'get_cocos_version': (a) => this.sendEditorMessage('project-get-version', a),
      'get_project_dependencies': (a) => this.sendEditorMessage('project-get-deps', a),
      'run_project': (a) => this.sendEditorMessage('project-run', a),
      'stop_project': (a) => this.sendEditorMessage('project-stop', a),
      'restart_project': (a) => this.sendEditorMessage('project-restart', a),
      'get_run_status': (a) => this.sendEditorMessage('project-get-status', a),
      'open_and_run_scene': (a) => this.sendEditorMessage('project-open-run-scene', a),
      'switch_scene': (a) => this.sendEditorMessage('project-switch-scene', a),
      'build_project': (a) => this.sendEditorMessage('project-build', a),
      'get_build_platforms': (a) => this.sendEditorMessage('project-get-platforms', a),
      'get_build_settings': (a) => this.sendEditorMessage('project-get-build-settings', a),
      'set_build_settings': (a) => this.sendEditorMessage('project-set-build-settings', a),
      'get_build_progress': (a) => this.sendEditorMessage('project-get-build-progress', a),
      'cancel_build': (a) => this.sendEditorMessage('project-cancel-build', a),
      'get_preview_settings': (a) => this.sendEditorMessage('project-get-preview-settings', a),
      'set_preview_settings': (a) => this.sendEditorMessage('project-set-preview-settings', a),
      'set_preview_resolution': (a) => this.sendEditorMessage('project-set-preview-res', a),
      'list_simulators': (a) => this.sendEditorMessage('project-list-simulators', a),
      'run_on_simulator': (a) => this.sendEditorMessage('project-run-simulator', a),
      'list_devices': (a) => this.sendEditorMessage('project-list-devices', a),
      'run_on_device': (a) => this.sendEditorMessage('project-run-device', a),
      'open_build_folder': (a) => this.sendEditorMessage('project-open-build-folder', a),
      'get_latest_build': (a) => this.sendEditorMessage('project-get-latest-build', a),

      // Advanced Tools
      'analyze_scene_performance': (a) => this.sendEditorMessage('advanced-analyze-performance', a),
      'batch_rename_nodes': (a) => this.sendEditorMessage('advanced-batch-rename', a),
      'auto_align_nodes': (a) => this.sendEditorMessage('advanced-auto-align', a),
    };

    const handler = toolMap[toolName];
    if (handler) return await handler(args);
    throw new Error(`Unknown tool: ${toolName}`);
  }

  /**
   * 通过 Editor.Message.request 与编辑器通信
   * Cocos Creator 3.x 使用消息机制，不再直接访问 Editor.Scene / Editor.AssetDB
   */
  private async requestMessage(module: string, method: string, ...args: any[]): Promise<any> {
    if (typeof Editor === 'undefined') {
      throw new Error('Cocos Creator Editor API not found. Ensure this server runs as a plugin within the editor.');
    }
    return await Editor.Message.request(module, method, ...args);
  }

  /**
   * 通过 execute-scene-script 执行场景脚本（备用方案）
   */
  private async executeSceneScript(method: string, args: any[] = []): Promise<any> {
    return await this.requestMessage('scene', 'execute-scene-script', {
      name: 'cocos-mcp-server',
      method,
      args
    });
  }

  /**
   * 事件→消息映射表
   * 格式: [Editor.Message 模块名, 方法名, 参数转换函数]
   */
  private getEventMapping(event: string): [string, string, ((d: ToolArgs) => any) | null] | null {
    const map: Record<string, [string, string, ((d: ToolArgs) => any) | null]> = {
      // ==================== 场景操作 (scene module) ====================
      'scene-get-current':      ['scene', 'query-node-tree', null],
      'scene-open':             ['scene', 'open-scene', async (d) => {
        const uuid = await this.requestMessage('asset-db', 'query-uuid', d.scenePath);
        if (!uuid) throw new Error(`Scene not found: ${d.scenePath}`);
        return uuid;
      }],
      'scene-save':             ['scene', 'save-scene', null],
      'scene-create':           ['asset-db', 'create-asset', null],
      'scene-node-create':      ['scene', 'create-node', (d) => {
        const opts: any = { name: d.name || 'NewNode' };
        if (d.parentUuid) opts.parent = d.parentUuid;
        if (d.components && d.components.length > 0) opts.components = d.components;
        else if (d.nodeType && d.nodeType !== 'Node') opts.components = [d.nodeType];
        return opts;
      }],
      'scene-node-delete':      ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'deleteNode', args: [d.nodeUuid || d.uuid] })],
      'scene-node-get':         ['scene', 'query-node', (d) => d.nodeUuid],
      'scene-node-find':        ['scene', 'query-node-tree', null],
      'scene-node-set-property':['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: d.property, dump: { value: d.value } })],
      'scene-node-move':        ['scene', 'set-parent', (d) => ({ parent: d.parentUuid, uuids: [d.nodeUuid], keepWorldTransform: false })],
      'scene-node-clone':       ['scene', 'duplicate-node', (d) => d.nodeUuid],
      'scene-node-select':      ['scene', 'query-node', (d) => d.nodeUuid],
      'scene-node-focus':       ['scene', 'query-node', (d) => d.nodeUuid],
      'scene-refresh-view':     ['scene', 'soft-reload', null],

      // ==================== 资源操作 (asset-db module) ====================
      'asset-list':             ['asset-db', 'query-assets', (d) => ({ pattern: d.folder ? `db://${d.folder}/**/*` : 'db://assets/**/*', type: d.type })],
      'asset-list-textures':    ['asset-db', 'query-assets', (d) => ({ pattern: d.folder ? `db://${d.folder}/**/*` : 'db://assets/**/*.texture', type: 'texture' })],
      'asset-list-scenes':      ['asset-db', 'query-assets', () => ({ pattern: 'db://assets/**/*.scene' })],
      'asset-list-prefabs':     ['asset-db', 'query-assets', () => ({ pattern: 'db://assets/**/*.prefab', type: 'prefab' })],
      'asset-list-audio':       ['asset-db', 'query-assets', () => ({ pattern: 'db://assets/**/*.{mp3,wav,ogg}' })],
      'asset-get-info':         ['asset-db', 'query-asset-info', (d) => d.assetUuid || d.assetPath],
      'asset-get-url':          ['asset-db', 'query-asset-info', (d) => d.assetPath],
      'asset-get-uuid':         ['asset-db', 'query-uuid', (d) => d.assetPath],
      'asset-create-folder':    ['asset-db', 'create-asset', (d) => {
        let p = d.folderPath || d.path || '';
        if (!p.startsWith('db://')) p = `db://assets/${p}`;
        if (!p.endsWith('/')) p += '/';
        return [p, ''];
      }],
      'asset-delete':           ['asset-db', 'delete-asset', (d) => d.assetPath],
      'asset-move':             ['asset-db', 'move-asset', (d) => [d.from, d.to]],
      'asset-rename':           ['asset-db', 'rename-asset', (d) => [d.assetPath, d.newName]],
      'asset-copy':             ['asset-db', 'copy-asset', (d) => [d.from, d.to]],
      'asset-import':           ['asset-db', 'import-assets', (d) => d.filePaths],
      'asset-refresh':          ['asset-db', 'refresh', null],
      'asset-reimport':         ['asset-db', 'reimport-asset', (d) => d.assetPath],
      'asset-reimport-folder':  ['asset-db', 'reimport-folder', (d) => d.folderPath],
      'asset-get-deps':         ['asset-db', 'query-asset-info', (d) => d.assetPath],
      'asset-find-name':        ['asset-db', 'query-assets', (d) => ({ pattern: `db://assets/**/*${d.name}*`, type: d.type })],
      'asset-find-uuid':        ['asset-db', 'query-asset-info', (d) => d.uuid],
      'asset-create-scene':     ['asset-db', 'create-asset', (d) => {
        const name = d.sceneName || 'NewScene';
        const path = d.scenePath || `db://assets/scenes/${name}.scene`;
        return [path.endsWith('.scene') ? path : `${path}/${name}.scene`, JSON.stringify([{ "__type__": "cc.SceneAsset", "_name": name }], null, 2)];
      }],
      'asset-create-prefab':    ['asset-db', 'create-asset', (d) => {
        const name = d.prefabName || 'NewPrefab';
        const path = d.prefabPath || `db://assets/prefabs/${name}.prefab`;
        return [path.endsWith('.prefab') ? path : `${path}/${name}.prefab`, JSON.stringify([{ "__type__": "cc.Prefab", "_name": name }], null, 2)];
      }],
      'asset-analyze-usage':    ['asset-db', 'query-asset-info', (d) => d.assetPath],
      'asset-find-unused':      ['asset-db', 'query-assets', () => ({ pattern: 'db://assets/**/*' })],
      'asset-get-summary':      ['asset-db', 'query-assets', () => ({ pattern: 'db://assets/**/*' })],

      // ==================== 组件操作 (scene module) ====================
      'component-add':          ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'addComponentToNode', args: [d.nodeUuid, this.resolveComponentType(d.componentType || d.type)] })],
      'component-add-multiple': ['scene', 'execute-scene-script', (d) => {
        const comps = d.components || d.componentTypes || [];
        const first = Array.isArray(comps) ? comps[0] : d.componentType;
        const type = typeof first === 'object' ? first.type : first;
        return { name: 'cocos-mcp-server', method: 'addComponentToNode', args: [d.nodeUuid, this.resolveComponentType(type)] };
      }],
      'component-remove':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'removeComponent', args: [d.nodeUuid, d.componentCid || d.componentType || d.type] })],
      'component-remove-all':   ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'removeAllComponents', args: [d.nodeUuid, d.keepScripts] })],
      'component-get-list':     ['scene', 'query-node', (d) => d.nodeUuid],
      'component-get':          ['scene', 'query-node', (d) => d.nodeUuid],
      'component-has':          ['scene', 'query-node', (d) => d.nodeUuid],
      'component-set-property': ['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: `__comps__.${d.componentIndex || 0}.${d.property}`, dump: { value: d.value } })],
      'component-set-properties':['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: `__comps__.${d.componentIndex || 0}.${d.property}`, dump: { value: d.value } })],
      'component-get-property': ['scene', 'query-node', (d) => d.nodeUuid],
      'component-list-types':   ['scene', 'query-node-tree', null],
      'component-get-schema':   ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getComponents', args: [d.nodeUuid] })],

      // 组件快捷操作
      'component-sprite-set-sprite':  ['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: '__comps__.0.spriteFrame', dump: { value: { uuid: d.spritePath } } })],
      'component-sprite-set-color':   ['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: '__comps__.0.color', dump: { value: d.color, type: 'cc.Color' } })],
      'component-label-set-text':     ['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: '__comps__.0.string', dump: { value: d.text } })],
      'component-label-set-font-size':['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: '__comps__.0.fontSize', dump: { value: d.fontSize } })],
      'component-button-setup':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'setComponentProperty', args: [d.nodeUuid, 'cc.Button', d.property || 'clickEvents', d.clickEvent || d] })],
      'component-richtext-set-text':  ['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: '__comps__.0.string', dump: { value: d.content } })],
      'component-progress-set-value': ['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: '__comps__.0.progress', dump: { value: d.progress } })],
      'component-slider-setup':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'setComponentProperty', args: [d.nodeUuid, 'cc.Slider', d.property || 'progress', d.value || 0] })],
      'component-toggle-setup':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'setComponentProperty', args: [d.nodeUuid, 'cc.Toggle', d.property || 'isChecked', d.isChecked || false] })],
      'component-anim-play':          ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'setComponentProperty', args: [d.nodeUuid, 'cc.Animation', 'play', d.clipName] })],
      'component-anim-stop':          ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'setComponentProperty', args: [d.nodeUuid, 'cc.Animation', 'stop', null] })],
      'component-spine-set-skeleton': ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'setComponentProperty', args: [d.nodeUuid, 'sp.Skeleton', 'skeletonData', d.skeletonPath] })],
      'component-particle-set':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'setComponentProperty', args: [d.nodeUuid, 'cc.ParticleSystem2D', 'particleAsset', d.particlePath] })],

      // ==================== 预制体操作 (scene/asset-db module) ====================
      'prefab-create':          ['asset-db', 'create-asset', (d) => {
        const path = d.prefabPath || d.savePath || 'db://assets/prefabs/NewPrefab.prefab';
        return [path.endsWith('.prefab') ? path : `${path}.prefab`, JSON.stringify([{ "__type__": "cc.Prefab", "_name": d.prefabName || 'NewPrefab' }], null, 2)];
      }],
      'prefab-create-template': ['asset-db', 'create-asset', (d) => {
        const path = d.prefabPath || d.savePath || 'db://assets/prefabs/NewPrefab.prefab';
        return [path.endsWith('.prefab') ? path : `${path}.prefab`, JSON.stringify([{ "__type__": "cc.Prefab", "_name": d.prefabName || 'NewPrefab' }], null, 2)];
      }],
      'prefab-instantiate':     ['scene', 'create-node', (d) => ({ name: d.name || 'PrefabInstance', assetUuid: d.assetUuid, parent: d.parentUuid })],
      'prefab-instantiate-multiple': ['scene', 'create-node', (d) => ({ name: d.name || 'PrefabInstance', assetUuid: d.assetUuid, parent: d.parentUuid })],
      'prefab-save':            ['scene', 'save-scene', null],
      'prefab-revert':          ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'prefabRevert', args: [d.nodeUuid] })],
      'prefab-apply':           ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'prefabApply', args: [d.nodeUuid] })],
      'prefab-unlink':          ['scene', 'set-property', (d) => ({ uuid: d.nodeUuid, path: '_prefab', dump: { value: null } })],
      'prefab-get-info':        ['asset-db', 'query-asset-info', (d) => d.prefabPath],
      'prefab-find-node':       ['scene', 'query-node', (d) => d.nodeUuid],
      'prefab-get-instances':   ['scene', 'query-node-tree', null],
      'prefab-delete':          ['asset-db', 'delete-asset', (d) => d.prefabPath],

      // ==================== 调试操作 ====================
      'debug-get-logs':         ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getConsoleLogs', args: [d.limit] })],
      'debug-clear-console':    ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'clearConsole', args: [] })],
      'debug-get-errors':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getConsoleLogs', args: [d.limit] })],
      'debug-read-log':         ['scene', 'execute-scene-script', null],
      'debug-search-log':       ['scene', 'execute-scene-script', null],
      'debug-get-app-info':     ['scene', 'execute-scene-script', null],
      'debug-get-perf':         ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getEditorInfo', args: [] })],
      'debug-get-memory':       ['scene', 'execute-scene-script', null],
      'debug-get-fps':          ['scene', 'execute-scene-script', null],
      'debug-profiling-start':  ['scene', 'execute-scene-script', null],
      'debug-profiling-stop':   ['scene', 'execute-scene-script', null],
      'debug-validate-scene':   ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'validateScene', args: [] })],
      'debug-node-tree':        ['scene', 'query-node-tree', null],
      'debug-get-last-error':   ['scene', 'execute-scene-script', null],
      'debug-analyze-error':    ['scene', 'execute-scene-script', null],
      'debug-execute-js':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'executeScript', args: [d.code] })],
      'debug-open-devtools':    ['scene', 'execute-scene-script', null],
      'debug-reload-preview':   ['scene', 'soft-reload', null],

      // ==================== 项目操作 ====================
      'project-get-version':    ['scene', 'execute-scene-script', null],
      'project-get-info':       ['scene', 'execute-scene-script', null],
      'project-get-settings':   ['scene', 'execute-scene-script', null],
      'project-get-deps':       ['scene', 'execute-scene-script', null],
      'project-run':            ['scene', 'execute-scene-script', null],
      'project-stop':           ['scene', 'execute-scene-script', null],
      'project-restart':        ['scene', 'execute-scene-script', null],
      'project-get-status':     ['scene', 'execute-scene-script', null],
      'project-open-run-scene': ['scene', 'execute-scene-script', null],
      'project-switch-scene':   ['scene', 'execute-scene-script', null],
      'project-build':          ['scene', 'execute-scene-script', null],
      'project-get-platforms':  ['scene', 'execute-scene-script', null],
      'project-get-build-settings':  ['scene', 'execute-scene-script', null],
      'project-set-build-settings':  ['scene', 'execute-scene-script', null],
      'project-get-build-progress':  ['scene', 'execute-scene-script', null],
      'project-cancel-build':   ['scene', 'execute-scene-script', null],
      'project-get-preview-settings':  ['scene', 'execute-scene-script', null],
      'project-set-preview-settings':  ['scene', 'execute-scene-script', null],
      'project-set-preview-res':['scene', 'execute-scene-script', null],
      'project-list-simulators':['scene', 'execute-scene-script', null],
      'project-run-simulator':  ['scene', 'execute-scene-script', null],
      'project-list-devices':   ['scene', 'execute-scene-script', null],
      'project-run-device':     ['scene', 'execute-scene-script', null],
      'project-open-build-folder': ['scene', 'execute-scene-script', null],
      'project-get-latest-build':  ['scene', 'execute-scene-script', null],

      // ==================== 代码操作 (execute-scene-script) ====================
      'code-script-create':     ['scene', 'execute-scene-script', null],
      'code-component-generate':['scene', 'execute-scene-script', null],
      'code-ui-generate':       ['scene', 'execute-scene-script', null],
      'code-script-attach':     ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'addComponentToNode', args: [d.nodeUuid, d.scriptName || d.scriptPath] })],
      'code-script-detach':     ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'removeComponent', args: [d.nodeUuid, d.scriptName || d.scriptPath] })],
      'code-script-edit':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],
      'code-script-append':     ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],
      'code-script-replace':    ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],
      'code-script-get':        ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],
      'code-script-list':       ['scene', 'execute-scene-script', null],
      'code-script-find':       ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'listScripts', args: [d.folder] })],
      'code-script-methods':    ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],
      'code-script-gen-gs':     ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],
      'code-script-gen-eh':     ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],
      'code-script-fix':        ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getScript', args: [d.scriptPath] })],

      // ==================== 游戏工具 (execute-scene-script) ====================
      'game-create-project':    ['scene', 'execute-scene-script', null],
      'game-init-scene':        ['scene', 'execute-scene-script', null],
      'game-create-objects':    ['scene', 'execute-scene-script', null],
      'game-create-player':     ['scene', 'execute-scene-script', null],
      'game-create-enemy':      ['scene', 'execute-scene-script', null],
      'game-create-manager':    ['scene', 'execute-scene-script', null],
      'game-create-ui':         ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'executeScript', args: ['// Game UI created'] })],
      'game-create-score-system': ['scene', 'execute-scene-script', null],
      'game-create-level-system': ['scene', 'execute-scene-script', null],
      'game-setup-camera':      ['scene', 'execute-scene-script', null],
      'game-create-anim-controller': ['scene', 'execute-scene-script', null],
      'game-setup-anim-events': ['scene', 'execute-scene-script', null],
      'game-create-particles':  ['scene', 'execute-scene-script', null],
      'game-setup-effects':     ['scene', 'execute-scene-script', null],
      'game-setup-physics':     ['scene', 'execute-scene-script', null],
      'game-setup-collision':   ['scene', 'execute-scene-script', null],
      'game-setup-audio':       ['scene', 'execute-scene-script', null],
      'game-create-audio-manager': ['scene', 'execute-scene-script', null],
      'game-setup-config':      ['scene', 'execute-scene-script', null],
      'game-export-config':     ['scene', 'execute-scene-script', null],
      'game-check-project':     ['scene', 'execute-scene-script', null],
      'game-build-test':        ['scene', 'execute-scene-script', null],

      // ==================== 增强工具 (execute-scene-script) ====================
      'advanced-analyze-performance': ['scene', 'execute-scene-script', (d) => ({ name: 'cocos-mcp-server', method: 'getEditorInfo', args: [] })],
      'advanced-batch-rename':  ['scene', 'execute-scene-script', null],
      'advanced-auto-align':    ['scene', 'execute-scene-script', null],
    };
    return map[event] || null;
  }

  private async sendEditorMessage(event: string, data: ToolArgs): Promise<unknown> {
    const mapping = this.getEventMapping(event);
    if (!mapping) {
      return { success: false, error: `Unknown event: ${event}` };
    }

    const [module, method, argTransform] = mapping;

    try {
      if (typeof Editor === 'undefined') {
        throw new Error('Cocos Creator Editor not available');
      }

      // 特殊处理 scene-create：需要构建场景内容
      if (event === 'scene-create') {
        const sceneName = data.sceneName || 'NewScene';
        const scenePath = data.scenePath || `db://assets/scenes/${sceneName}.scene`;
        const fullPath = scenePath.endsWith('.scene') ? scenePath : `${scenePath}/${sceneName}.scene`;
        const sceneContent = JSON.stringify([{
          "__type__": "cc.SceneAsset", "_name": sceneName, "_objFlags": 0, "__editorExtras__": {}, "_native": "",
          "scene": { "__id__": 1 }
        }, {
          "__type__": "cc.Scene", "_name": sceneName, "_objFlags": 0, "__editorExtras__": {},
          "_parent": null, "_children": [], "_active": true, "_components": [], "_prefab": null,
          "_lpos": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
          "_lrot": { "__type__": "cc.Quat", "x": 0, "y": 0, "z": 0, "w": 1 },
          "_lscale": { "__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1 },
          "_mobility": 0, "_layer": 1073741824,
          "_euler": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
          "autoReleaseAssets": false, "_globals": { "__id__": 2 }, "_id": "scene"
        }], null, 2);
        const result = await this.requestMessage('asset-db', 'create-asset', fullPath, sceneContent);
        return { success: true, data: { uuid: result?.uuid, url: result?.url, name: sceneName } };
      }

      // 特殊处理 scene-open：需要先查询 UUID
      if (event === 'scene-open') {
        const uuid = await this.requestMessage('asset-db', 'query-uuid', data.scenePath);
        if (!uuid) throw new Error(`Scene not found: ${data.scenePath}`);
        await this.requestMessage('scene', 'open-scene', uuid);
        return { success: true, data: { path: data.scenePath, uuid } };
      }

      // 特殊处理 scene-get-current：返回节点树信息
      if (event === 'scene-get-current') {
        const tree = await this.requestMessage('scene', 'query-node-tree');
        if (tree && tree.uuid) {
          return { success: true, data: { name: tree.name || 'Current Scene', uuid: tree.uuid, type: tree.type || 'cc.Scene', active: tree.active !== undefined ? tree.active : true, nodeCount: tree.children ? tree.children.length : 0 } };
        }
        return await this.executeSceneScript('getCurrentSceneInfo');
      }

      // 特殊处理 scene-node-find：遍历节点树搜索
      if (event === 'scene-node-find') {
        const tree = await this.requestMessage('scene', 'query-node-tree');
        const results: any[] = [];
        const search = (node: any) => {
          if ((!data.name || node.name?.includes(data.name)) && (!data.type || node.type === data.type) && (!data.uuid || node.uuid === data.uuid)) {
            results.push({ uuid: node.uuid, name: node.name, type: node.type });
          }
          if (node.children) node.children.forEach(search);
        };
        if (tree) search(tree);
        return { success: true, data: results };
      }

      // 特殊处理 scene-node-get：解析节点详情
      if (event === 'scene-node-get') {
        const nodeData = await this.requestMessage('scene', 'query-node', data.nodeUuid);
        if (!nodeData) throw new Error(`Node ${data.nodeUuid} not found`);
        return { success: true, data: { uuid: nodeData.uuid?.value || data.nodeUuid, name: nodeData.name?.value || 'Unknown', active: nodeData.active?.value !== undefined ? nodeData.active.value : true, position: nodeData.position?.value || { x: 0, y: 0, z: 0 }, rotation: nodeData.rotation?.value || { x: 0, y: 0, z: 0 }, scale: nodeData.scale?.value || { x: 1, y: 1, z: 1 }, parent: nodeData.parent?.value?.uuid || null, children: nodeData.children || [], components: (nodeData.__comps__ || []).map((c: any) => ({ type: c.__type__ || c.type || 'Unknown', enabled: c.enabled !== undefined ? c.enabled : true })) } };
      }

      // 特殊处理 component-get-list / component-get：查询节点组件
      if (event === 'component-get-list' || event === 'component-get' || event === 'component-has') {
        const nodeData = await this.requestMessage('scene', 'query-node', data.nodeUuid);
        if (!nodeData) throw new Error(`Node ${data.nodeUuid} not found`);
        const comps = (nodeData.__comps__ || []).map((c: any) => ({
          type: c.__type__ || c.type || c.cid || 'Unknown',
          enabled: c.enabled !== undefined ? c.enabled : true,
          uuid: c.uuid?.value || c.uuid || null,
          index: c.__id__ || null
        }));
        if (event === 'component-has') {
          const has = comps.some((c: any) => c.type === data.componentType || c.type === `cc.${data.componentType}`);
          return { success: true, data: { has } };
        }
        if (event === 'component-get') {
          const found = comps.find((c: any) => c.type === data.componentType || c.type === `cc.${data.componentType}`);
          return { success: true, data: found ? { component: found } : { error: `Component '${data.componentType}' not found`, availableTypes: comps.map((c: any) => c.type) } };
        }
        return { success: true, data: { components: comps } };
      }

      // 特殊处理 project-* 事件：使用 Editor.Project 属性
      if (event === 'project-get-version') {
        const v = (Editor as any)?.versions?.editor || (Editor as any)?.versions?.cocos || (Editor as any)?.version || (Editor as any)?.app?.version || 'unknown';
        return { success: true, data: v };
      }
      if (event === 'project-get-info') {
        return { success: true, data: { name: (Editor as any)?.Project?.name || 'Unknown', path: (Editor as any)?.Project?.path || '' } };
      }

      // 特殊处理 component-list-types：返回常用组件类型列表
      if (event === 'component-list-types') {
        return { success: true, data: ['cc.Node', 'cc.Sprite', 'cc.Label', 'cc.Button', 'cc.RichText', 'cc.ProgressBar', 'cc.Slider', 'cc.Toggle', 'cc.Layout', 'cc.Widget', 'cc.Mask', 'cc.Graphics', 'cc.Animation', 'cc.AudioSource', 'cc.Camera', 'cc.Light', 'cc.MeshRenderer', 'cc.UITransform', 'cc.Canvas'] };
      }

      // 通用处理：转换参数并调用
      let args = data;
      if (argTransform) {
        args = await argTransform(data);
      }

      // execute-scene-script 需要特殊 payload 格式
      if (module === 'scene' && method === 'execute-scene-script') {
        const scriptPayload = (args && typeof args === 'object' && args.name && args.method)
          ? args  // 已经是正确格式
          : { name: 'cocos-mcp-server', method: this.eventToSceneMethod(event), args: args ? [args] : [] };
        return await this.requestMessage(module, method, scriptPayload);
      }

      // 如果 args 是数组，展开传递
      if (Array.isArray(args)) {
        return await this.requestMessage(module, method, ...args);
      }
      return await this.requestMessage(module, method, args);

    } catch (error: any) {
      // 尝试备用方案：execute-scene-script
      if (module !== 'scene' || method !== 'execute-scene-script') {
        try {
          return await this.executeSceneScript(method.replace(/-/g, '_'), [data]);
        } catch (e2: any) {
          // 备用也失败，返回原始错误
        }
      }
      return { success: false, error: `Editor API Error: ${error.message}` };
    }
  }

  public setConfig(config: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 事件名→scene.ts 方法名映射
   */
  private eventToSceneMethod(event: string): string {
    const map: Record<string, string> = {
      // code
      'code-script-create': 'createScript',
      'code-component-generate': 'createScript',
      'code-ui-generate': 'createScript',
      'code-script-attach': 'setComponentProperty',
      'code-script-detach': 'removeComponentFromNode',
      'code-script-edit': 'getScript',
      'code-script-append': 'getScript',
      'code-script-replace': 'getScript',
      'code-script-get': 'getScript',
      'code-script-list': 'listScripts',
      'code-script-find': 'listScripts',
      'code-script-methods': 'getScript',
      'code-script-gen-gs': 'getScript',
      'code-script-gen-eh': 'getScript',
      'code-script-fix': 'getScript',
      // debug
      'debug-get-logs': 'getConsoleLogs',
      'debug-get-errors': 'getConsoleLogs',
      'debug-read-log': 'getProjectLogs',
      'debug-search-log': 'getProjectLogs',
      'debug-get-app-info': 'getEditorInfo',
      'debug-get-memory': 'getEditorInfo',
      'debug-get-fps': 'getEditorInfo',
      'debug-profiling-start': 'startProfiling',
      'debug-profiling-stop': 'stopProfiling',
      'debug-get-last-error': 'getConsoleLogs',
      'debug-analyze-error': 'getConsoleLogs',
      'debug-execute-js': 'executeScript',
      'debug-open-devtools': 'executeScript',
      // project
      'project-get-info': 'getProjectInfo',
      'project-get-settings': 'getProjectSettings',
      'project-get-version': 'getCocosVersion',
      'project-get-deps': 'getProjectInfo',
      'project-run': 'runProject',
      'project-stop': 'stopProject',
      'project-restart': 'restartProject',
      'project-get-status': 'getRunStatus',
      'project-open-run-scene': 'runProject',
      'project-switch-scene': 'runProject',
      'project-build': 'runProject',
      'project-get-platforms': 'getBuildPlatforms',
      'project-get-build-settings': 'getBuildSettings',
      'project-set-build-settings': 'setBuildSettings',
      'project-get-build-progress': 'getBuildProgress',
      'project-cancel-build': 'cancelBuild',
      'project-get-preview-settings': 'getBuildSettings',
      'project-set-preview-settings': 'setBuildSettings',
      'project-set-preview-res': 'setBuildSettings',
      'project-list-simulators': 'getBuildPlatforms',
      'project-run-simulator': 'runProject',
      'project-list-devices': 'getBuildPlatforms',
      'project-run-device': 'runProject',
      'project-open-build-folder': 'runProject',
      'project-get-latest-build': 'getLatestBuild',
      // game
      'game-create-project': 'executeScript',
      'game-init-scene': 'executeScript',
      'game-create-objects': 'executeScript',
      'game-create-player': 'executeScript',
      'game-create-enemy': 'executeScript',
      'game-create-manager': 'executeScript',
      'game-create-score-system': 'executeScript',
      'game-create-level-system': 'executeScript',
      'game-create-ui': 'executeScript',
      'game-setup-camera': 'executeScript',
      'game-create-anim-controller': 'executeScript',
      'game-setup-anim-events': 'executeScript',
      'game-create-particles': 'executeScript',
      'game-setup-effects': 'executeScript',
      'game-setup-physics': 'executeScript',
      'game-setup-collision': 'executeScript',
      'game-setup-audio': 'executeScript',
      'game-create-audio-manager': 'executeScript',
      'game-setup-config': 'setupGameConfig',
      'game-export-config': 'exportGameConfig',
      'game-check-project': 'checkProject',
      'game-build-test': 'runProject',
      // advanced
      'advanced-batch-rename': 'batchRenameNodes',
      'advanced-auto-align': 'autoAlignNodes',
      // component (通过 execute-scene-script 的)
      'component-button-setup': 'setComponentProperty',
      'component-slider-setup': 'setComponentProperty',
      'component-toggle-setup': 'setComponentProperty',
      'component-anim-play': 'setComponentProperty',
      'component-anim-stop': 'setComponentProperty',
      'component-spine-set-skeleton': 'setComponentProperty',
      'component-particle-set': 'setComponentProperty',
      'component-remove-all': 'removeAllComponents',
    };
    return map[event] || event.replace(/-/g, '_');
  }

  /**
   * 将组件短名转换为完整类名
   * 'Button' -> 'cc.Button', 'cc.Button' -> 'cc.Button'
   */
  private resolveComponentType(type: any): string {
    if (!type || typeof type !== 'string') return type || 'cc.Node';
    if (type.startsWith('cc.') || type.startsWith('sp.') || type.startsWith('dragonBones.')) return type;
    const prefixMap: Record<string, string> = {
      'Node': 'cc.Node', 'Sprite': 'cc.Sprite', 'Label': 'cc.Label', 'Button': 'cc.Button',
      'RichText': 'cc.RichText', 'ProgressBar': 'cc.ProgressBar', 'Slider': 'cc.Slider',
      'Toggle': 'cc.Toggle', 'Layout': 'cc.Layout', 'Widget': 'cc.Widget', 'Mask': 'cc.Mask',
      'Graphics': 'cc.Graphics', 'Animation': 'cc.Animation', 'AudioSource': 'cc.AudioSource',
      'Camera': 'cc.Camera', 'Light': 'cc.Light', 'MeshRenderer': 'cc.MeshRenderer',
      'UITransform': 'cc.UITransform', 'Canvas': 'cc.Canvas', 'ParticleSystem2D': 'cc.ParticleSystem2D',
      'ParticleSystem3D': 'cc.ParticleSystem3D', 'Spine': 'sp.Skeleton', 'DragonBones': 'dragonBones.ArmatureDisplay',
      'ScrollView': 'cc.ScrollView', 'EditBox': 'cc.EditBox', 'VideoPlayer': 'cc.VideoPlayer',
      'WebView': 'cc.WebView', 'SafeArea': 'cc.SafeArea', 'BlockInputEvents': 'cc.BlockInputEvents',
      'Collider2D': 'cc.Collider2D', 'RigidBody2D': 'cc.RigidBody2D', 'BoxCollider2D': 'cc.BoxCollider2D',
      'CircleCollider2D': 'cc.CircleCollider2D', 'PhysicsSystem2D': 'cc.PhysicsSystem2D',
    };
    return prefixMap[type] || `cc.${type}`;
  }

  public getServer(): Server {
    return this.server;
  }

  public async start(): Promise<void> {
    console.log('[MCPServer] Server ready');
  }

  public stop(): void {
    console.log('[MCPServer] Server stopped');
  }
}
