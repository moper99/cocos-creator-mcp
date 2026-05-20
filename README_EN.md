# Cocos MCP Server

Cocos Creator AI MCP Server - Let AI assist Cocos Creator development

> Version 1.1.0 | Compatible with Cocos Creator 3.8.0+

## Features

🚀 **9 categories, 160 tools** — all communicating with the editor via `Editor.Message`:

### 🎮 Scene Operations (14 tools)
- **Management**: `get_current_scene`, `list_scenes`, `open_scene`, `save_scene`, `create_scene`
- **Nodes**: `create_node`, `delete_node`, `find_nodes`, `get_node`, `set_node_property`, `move_node`, `clone_node`
- **View**: `refresh_scene_view`, `select_node`, `focus_node`

### 💻 Code Operations (15 tools)
- **Scripts**: `create_script`, `get_script`, `list_scripts`, `find_script`, `get_script_methods`
- **Generation**: `generate_component`, `generate_ui_component`, `generate_getter_setter`, `generate_event_handler`
- **Editing**: `edit_script`, `append_to_script`, `replace_in_script`, `fix_script_errors`
- **Lifecycle**: `attach_script`, `detach_script`

### 📦 Asset Management (25 tools)
- **Query**: `list_assets`, `list_textures`, `list_scenes`, `list_prefabs`, `list_audio`, `find_asset_by_name`, `find_assets_by_uuid`
- **Operations**: `import_assets`, `delete_asset`, `move_asset`, `copy_asset`, `rename_asset`, `create_folder`, `create_empty_scene`, `create_empty_prefab`
- **Analysis**: `get_asset_info`, `get_asset_dependencies`, `analyze_asset_usage`, `find_unused_assets`, `get_project_assets_summary`, `get_asset_url`, `get_asset_uuid`, `refresh_assets`, `reimport_asset`, `reimport_folder`

### ⚙️ Component Operations (25 tools)
- **Basics**: `list_component_types`, `get_component_schema`, `add_component`, `add_multiple_components`, `remove_component`, `remove_all_components`, `get_components`, `get_component`, `has_component`
- **Properties**: `set_component_property`, `set_component_properties`, `get_component_property`
- **Specialized**: `set_sprite_sprite`, `set_sprite_color`, `set_label_text`, `set_label_font_size`, `setup_button`, `set_rich_text`, `set_progress_bar`, `setup_slider`, `setup_toggle`, `play_animation`, `stop_animation`, `set_spine_skeleton`, `set_particle`

### 🔍 Debug & Analysis (19 tools)
- **Logs**: `get_console_logs`, `clear_console`, `get_error_logs`, `read_project_log`, `search_log`, `get_last_error`, `analyze_error`
- **Monitoring**: `get_editor_info`, `get_app_info`, `get_performance_stats`, `get_memory_usage`, `get_fps`
- **Advanced**: `start_profiling`, `stop_profiling`, `validate_scene`, `debug_node_tree`, `execute_js`, `open_devtools`, `reload_preview`

### 🏗️ Prefab Operations (12 tools)
- **Lifecycle**: `create_prefab`, `create_prefab_from_template`, `instantiate_prefab`, `instantiate_multiple_prefab`, `delete_prefab`
- **State**: `prefab_save`, `prefab_revert`, `prefab_apply`, `prefab_unlink`
- **Query**: `list_prefabs`, `get_prefab_info`, `find_prefab_by_node`, `get_prefab_instances`

### 🚀 Project Build & Run (25 tools)
- **Management**: `get_project_info`, `get_project_settings`, `get_cocos_version`, `get_project_dependencies`
- **Run**: `run_project`, `stop_project`, `restart_project`, `get_run_status`, `open_and_run_scene`, `switch_scene`
- **Build**: `build_project`, `get_build_platforms`, `get_build_settings`, `set_build_settings`, `get_build_progress`, `cancel_build`
- **Preview**: `get_preview_settings`, `set_preview_settings`, `set_preview_resolution`, `list_simulators`, `run_on_simulator`, `list_devices`, `run_on_device`, `open_build_folder`, `get_latest_build`

### 🎲 Game Rapid Development (22 tools)
- **Initialization**: `create_game_project`, `init_game_scene`, `create_game_objects`
- **Systems**: `create_player`, `create_enemy`, `create_game_manager`, `create_score_system`, `create_level_system`, `create_game_ui`
- **Environment**: `setup_camera`, `create_animation_controller`, `setup_animation_events`, `create_particle_system`, `setup_effects`, `setup_physics`, `setup_collision`, `setup_audio`, `create_audio_manager`
- **Testing**: `setup_game_config`, `export_game_config`, `check_project`, `build_and_test`

### 🛠️ Advanced Tools (3 tools)
- **Performance**: `analyze_scene_performance`
- **Batch**: `batch_rename_nodes`, `auto_align_nodes`

## Quick Start

### 1. Install

Copy the project to your Cocos Creator extensions directory:

```
your-cocos-project/
├── assets/
├── extensions/
│   └── cocos-mcp-server/    ← Place here
├── settings/
└── ...
```

### 2. Build

```bash
cd extensions/cocos-mcp-server
npm install
npm run build
```

### 3. Start

1. Restart Cocos Creator
2. Click menu: `Extension` → `Cocos MCP Server` → `Open MCP Server`
3. Server runs at `http://127.0.0.1:3000/mcp`

### 4. Configure AI Client

**Claude CLI:**
```bash
claude mcp add --transport http cocos-creator http://127.0.0.1:3000/mcp
```

**Cursor / VS Code:**
```json
{
  "mcpServers": {
    "cocos-creator": {
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

## Usage Examples

### Create Node with Component

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

### Set Label Text

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

## Architecture

### Communication Flow

```
AI Client ──HTTP──→ http-server.ts ──→ mcp-server.ts ──→ Editor.Message.request()
                                                                  ↓
                                                          Cocos Creator Editor
```

- **Editor.Message.request()**: Standard Cocos Creator message mechanism
- **execute-scene-script**: Fallback for scene script execution in renderer context

### Project Structure

```
cocos-mcp-server/
├── src/
│   ├── main.ts              # Plugin entry (load/unload)
│   ├── http-server.ts       # HTTP server
│   ├── mcp-server.ts        # MCP core (event mapping, dispatch)
│   ├── scene.ts             # Scene scripts (runs in editor context)
│   ├── types.ts             # Type definitions
│   ├── globals.d.ts         # Editor API declarations
│   └── tools/
│       ├── scene-tools.ts       # Scene tool definitions
│       ├── code-tools.ts        # Code tool definitions
│       ├── asset-tools.ts       # Asset tool definitions
│       ├── prefab-tools.ts      # Prefab tool definitions
│       ├── component-tools.ts   # Component tool definitions
│       ├── debug-tools.ts       # Debug tool definitions
│       ├── project-tools.ts     # Project tool definitions
│       ├── game-tools.ts        # Game tool definitions
│       ├── advanced-tools.ts    # Advanced tool definitions
│       └── index.ts             # Tool exports
├── dist/
│   ├── main.js              # Main process bundle
│   └── scene.js             # Scene script bundle
├── package.json             # Extension config
├── tsconfig.json
└── scripts/
    └── build.js             # Build script
```

### Component Type Resolution

Tools accept both short names and full class names:

| Short Name | Auto-resolved to |
|-----------|-----------------|
| `Button` | `cc.Button` |
| `Sprite` | `cc.Sprite` |
| `Label` | `cc.Label` |
| `cc.Node` | `cc.Node` (unchanged) |

## Security

- HTTP listens on `127.0.0.1` only (localhost access)
- Request body limit: 1MB
- `executeScript` has dangerous operation blacklist

## License

MIT License
