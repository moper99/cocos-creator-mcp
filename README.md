# Cocos MCP Server

Cocos Creator AI MCP Server - 让 AI 辅助开发 Cocos Creator 项目

> 版本 1.1.0 | 兼容 Cocos Creator 3.8.0+

## 功能特点

🚀 **9大类工具，160 个核心功能**，全部通过 `Editor.Message` 消息通信机制与编辑器交互：

### 🎮 场景操作（14 个工具）
- **管理**：`get_current_scene`, `list_scenes`, `open_scene`, `save_scene`, `create_scene`
- **节点**：`create_node`, `delete_node`, `find_nodes`, `get_node`, `set_node_property`, `move_node`, `clone_node`
- **视图**：`refresh_scene_view`, `select_node`, `focus_node`

### 💻 代码操作（15 个工具）
- **脚本管理**：`create_script`, `get_script`, `list_scripts`, `find_script`, `get_script_methods`
- **自动化生成**：`generate_component`, `generate_ui_component`, `generate_getter_setter`, `generate_event_handler`
- **编辑增强**：`edit_script`, `append_to_script`, `replace_in_script`, `fix_script_errors`
- **生命周期**：`attach_script`, `detach_script`

### 📦 资源管理（25 个工具）
- **查询**：`list_assets`, `list_textures`, `list_scenes`, `list_prefabs`, `list_audio`, `find_asset_by_name`, `find_assets_by_uuid`
- **操作**：`import_assets`, `delete_asset`, `move_asset`, `copy_asset`, `rename_asset`, `create_folder`, `create_empty_scene`, `create_empty_prefab`
- **分析**：`get_asset_info`, `get_asset_dependencies`, `analyze_asset_usage`, `find_unused_assets`, `get_project_assets_summary`, `get_asset_url`, `get_asset_uuid`, `refresh_assets`, `reimport_asset`, `reimport_folder`

### ⚙️ 组件操作（25 个工具）
- **基础**：`list_component_types`, `get_component_schema`, `add_component`, `add_multiple_components`, `remove_component`, `remove_all_components`, `get_components`, `get_component`, `has_component`
- **属性**：`set_component_property`, `set_component_properties`, `get_component_property`
- **专项**：`set_sprite_sprite`, `set_sprite_color`, `set_label_text`, `set_label_font_size`, `setup_button`, `set_rich_text`, `set_progress_bar`, `setup_slider`, `setup_toggle`, `play_animation`, `stop_animation`, `set_spine_skeleton`, `set_particle`

### 🔍 调试分析（19 个工具）
- **日志**：`get_console_logs`, `clear_console`, `get_error_logs`, `read_project_log`, `search_log`, `get_last_error`, `analyze_error`
- **监控**：`get_editor_info`, `get_app_info`, `get_performance_stats`, `get_memory_usage`, `get_fps`
- **高级**：`start_profiling`, `stop_profiling`, `validate_scene`, `debug_node_tree`, `execute_js`, `open_devtools`, `reload_preview`

### 🏗️ 预制体操作（12 个工具）
- **生命周期**：`create_prefab`, `create_prefab_from_template`, `instantiate_prefab`, `instantiate_multiple_prefab`, `delete_prefab`
- **状态**：`prefab_save`, `prefab_revert`, `prefab_apply`, `prefab_unlink`
- **查询**：`list_prefabs`, `get_prefab_info`, `find_prefab_by_node`, `get_prefab_instances`

### 🚀 项目构建（25 个工具）
- **管理**：`get_project_info`, `get_project_settings`, `get_cocos_version`, `get_project_dependencies`
- **运行**：`run_project`, `stop_project`, `restart_project`, `get_run_status`, `open_and_run_scene`, `switch_scene`
- **发布**：`build_project`, `get_build_platforms`, `get_build_settings`, `set_build_settings`, `get_build_progress`, `cancel_build`
- **预览**：`get_preview_settings`, `set_preview_settings`, `set_preview_resolution`, `list_simulators`, `run_on_simulator`, `list_devices`, `run_on_device`, `open_build_folder`, `get_latest_build`

### 🎲 游戏快速开发（22 个工具）
- **项目初始化**：`create_game_project`, `init_game_scene`, `create_game_objects`
- **角色与系统**：`create_player`, `create_enemy`, `create_game_manager`, `create_score_system`, `create_level_system`, `create_game_ui`
- **环境搭建**：`setup_camera`, `create_animation_controller`, `setup_animation_events`, `create_particle_system`, `setup_effects`, `setup_physics`, `setup_collision`, `setup_audio`, `create_audio_manager`
- **配置与测试**：`setup_game_config`, `export_game_config`, `check_project`, `build_and_test`

### 🛠️ 增强工具（3 个工具）
- **性能分析**：`analyze_scene_performance`
- **批量操作**：`batch_rename_nodes`, `auto_align_nodes`

## 使用方法

### 1. 安装

将项目复制到 Cocos Creator 扩展目录：

```
your-cocos-project/
├── assets/
├── extensions/
│   └── cocos-mcp-server/    ← 放置于此
├── settings/
└── ...
```

### 2. 构建

```bash
cd extensions/cocos-mcp-server
npm install
npm run build
```

### 3. 启动

1. 重启 Cocos Creator
2. 点击菜单：`扩展` → `Cocos MCP Server` → `Open MCP Server`
3. 服务器运行在 `http://127.0.0.1:3000/mcp`

### 4. 配置 AI 客户端

**Claude CLI：**
```bash
claude mcp add --transport http cocos-creator http://127.0.0.1:3000/mcp
```

**Cursor / VS Code：**
```json
{
  "mcpServers": {
    "cocos-creator": {
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

## 调用示例

### 创建节点并添加组件

```json
{
  "method": "tools/call",
  "params": {
    "name": "create_node",
    "arguments": {
      "name": "Player",
      "nodeType": "Sprite",
      "position": { "x": 0, "y": 0 }
    }
  }
}
```

### 设置 Label 文本

```json
{
  "method": "tools/call",
  "params": {
    "name": "set_label_text",
    "arguments": {
      "nodeUuid": "xxx",
      "text": "Hello World"
    }
  }
}
```

## 技术架构

### 通信机制

```
AI 客户端 ──HTTP──→ http-server.ts ──→ mcp-server.ts ──→ Editor.Message.request()
                                                                  ↓
                                                            Cocos Creator 编辑器
```

- **Editor.Message.request()**：通过 Cocos Creator 标准消息机制与编辑器通信
- **execute-scene-script**：场景脚本备用方案，运行在编辑器渲染进程上下文中

### 项目结构

```
cocos-mcp-server/
├── src/
│   ├── main.ts              # 插件入口（load/unload）
│   ├── http-server.ts       # HTTP 服务器
│   ├── mcp-server.ts        # MCP 核心（事件映射、消息分发）
│   ├── scene.ts             # 场景脚本（运行在编辑器场景上下文）
│   ├── types.ts             # 类型定义
│   ├── globals.d.ts         # Editor API 声明
│   └── tools/
│       ├── scene-tools.ts       # 场景操作工具定义
│       ├── code-tools.ts        # 代码操作工具定义
│       ├── asset-tools.ts       # 资源管理工具定义
│       ├── prefab-tools.ts      # 预制体操作工具定义
│       ├── component-tools.ts   # 组件操作工具定义
│       ├── debug-tools.ts       # 调试分析工具定义
│       ├── project-tools.ts     # 项目构建工具定义
│       ├── game-tools.ts        # 游戏快速开发工具定义
│       ├── advanced-tools.ts    # 增强工具定义
│       └── index.ts             # 工具统一导出
├── dist/
│   ├── main.js              # 主进程打包产物
│   └── scene.js             # 场景脚本产物
├── package.json             # 扩展配置
├── tsconfig.json
└── scripts/
    └── build.js             # 构建脚本
```

### 组件类型自动解析

工具支持短名和完整类名两种格式，自动转换：

| 短名 | 自动转换为 |
|------|-----------|
| `Button` | `cc.Button` |
| `Sprite` | `cc.Sprite` |
| `Label` | `cc.Label` |
| `cc.Node` | `cc.Node`（已完整则不变） |

## 安全特性

- HTTP 仅监听 `127.0.0.1`（仅本机可访问）
- 请求体限制 1MB
- `executeScript` 方法包含危险操作黑名单

## 许可证

MIT License
