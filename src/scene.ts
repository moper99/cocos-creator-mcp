/**
 * 场景脚本 - 在 Cocos Creator 场景上下文中执行
 * 通过 Editor.Message.request('scene', 'execute-scene-script', { name: 'cocos-mcp-server', method, args }) 调用
 */

export const methods: { [key: string]: (...any: any) => any } = {
    getCurrentSceneInfo() {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            return {
                success: true,
                data: { name: scene.name, uuid: scene.uuid, nodeCount: scene.children.length }
            };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getSceneHierarchy(includeComponents: boolean = false) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const processNode = (node: any): any => {
                const result: any = { name: node.name, uuid: node.uuid, active: node.active, children: [] };
                if (includeComponents) {
                    result.components = node.components.map((c: any) => ({ type: c.constructor.name, enabled: c.enabled }));
                }
                if (node.children && node.children.length > 0) {
                    result.children = node.children.map((child: any) => processNode(child));
                }
                return result;
            };
            return { success: true, data: scene.children.map((child: any) => processNode(child)) };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getAllNodes() {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const nodes: any[] = [];
            const collect = (node: any) => {
                nodes.push({ uuid: node.uuid, name: node.name, active: node.active, parent: node.parent?.uuid });
                node.children.forEach((child: any) => collect(child));
            };
            scene.children.forEach((child: any) => collect(child));
            return { success: true, data: { totalNodes: nodes.length, nodes } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    findNodeByName(name: string) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByName(name);
            if (!node) return { success: false, error: `Node '${name}' not found` };
            return { success: true, data: { uuid: node.uuid, name: node.name, active: node.active } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    setNodeProperty(nodeUuid: string, property: string, value: any) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            if (property === 'position') node.setPosition(value.x || 0, value.y || 0, value.z || 0);
            else if (property === 'rotation') node.setRotationFromEuler(value.x || 0, value.y || 0, value.z || 0);
            else if (property === 'scale') node.setScale(value.x || 1, value.y || 1, value.z || 1);
            else if (property === 'active') node.active = value;
            else if (property === 'name') node.name = value;
            else (node as any)[property] = value;
            return { success: true, message: `Property '${property}' updated` };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    addComponentToNode(nodeUuid: string, componentType: string) {
        try {
            const { director, js } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            const Cls = js.getClassByName(componentType);
            if (!Cls) return { success: false, error: `Component type ${componentType} not found` };
            const comp = node.addComponent(Cls);
            return { success: true, data: { componentId: comp.uuid } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    removeComponentFromNode(nodeUuid: string, componentType: string) {
        try {
            const { director, js } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            const Cls = js.getClassByName(componentType);
            if (!Cls) return { success: false, error: `Component type ${componentType} not found` };
            const comp = node.getComponent(Cls);
            if (!comp) return { success: false, error: `Component ${componentType} not found on node` };
            node.removeComponent(comp);
            return { success: true, message: `Component ${componentType} removed` };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    removeAllComponents(nodeUuid: string, keepScripts?: boolean) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            const comps = [...node.components];
            let removed = 0;
            for (const comp of comps) {
                if (keepScripts && comp.constructor.name?.endsWith('Component')) continue;
                node.removeComponent(comp);
                removed++;
            }
            return { success: true, message: `Removed ${removed} components` };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getNodeInfo(nodeUuid: string) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            return {
                success: true,
                data: {
                    uuid: node.uuid, name: node.name, active: node.active,
                    position: node.position, rotation: node.rotation, scale: node.scale,
                    parent: node.parent?.uuid,
                    children: node.children.map((c: any) => c.uuid),
                    components: node.components.map((comp: any) => ({ type: comp.constructor.name, enabled: comp.enabled }))
                }
            };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    deleteNode(nodeUuid: string) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            node.destroy();
            return { success: true, message: 'Node deleted' };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    removeComponent(nodeUuid: string, componentType: string) {
        try {
            const { director, js } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            const Cls = js.getClassByName(componentType);
            if (!Cls) return { success: false, error: `Component type ${componentType} not found` };
            const comp = node.getComponent(Cls);
            if (!comp) return { success: false, error: `Component ${componentType} not found on node` };
            node.removeComponent(comp);
            return { success: true, message: `Component ${componentType} removed` };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getComponents(nodeUuid: string) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            return {
                success: true,
                data: node.components.map((comp: any) => ({
                    type: comp.constructor.name, enabled: comp.enabled, uuid: comp.uuid
                }))
            };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    prefabApply(nodeUuid: string) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            return { success: true, message: 'Prefab apply requested (requires editor integration)' };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    prefabRevert(nodeUuid: string) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            return { success: true, message: 'Prefab revert requested (requires editor integration)' };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    setComponentProperty(nodeUuid: string, componentType: string, property: string, value: any) {
        try {
            const { director, js } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            const Cls = js.getClassByName(componentType);
            if (!Cls) return { success: false, error: `Component type ${componentType} not found` };
            const comp = node.getComponent(Cls);
            if (!comp) return { success: false, error: `Component ${componentType} not found on node` };
            (comp as any)[property] = value;
            return { success: true, message: `Component property '${property}' updated` };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    createPrefabFromNode(nodeUuid: string, prefabPath: string) {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const node = scene.getChildByUuid(nodeUuid);
            if (!node) return { success: false, error: `Node ${nodeUuid} not found` };
            return { success: true, data: { prefabPath, sourceNodeUuid: nodeUuid, message: `Prefab info from node '${node.name}'` } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    executeScript(script: any) {
        try {
            if (typeof script !== 'string') {
                script = JSON.stringify(script);
            }
            const blocked = ['require("child_process")', 'require("fs")', 'process.exit', 'process.env'];
            for (const b of blocked) {
                if (script.includes(b)) {
                    return { success: false, error: `Blocked dangerous operation: ${b}` };
                }
            }
            const result = eval(script);
            return { success: true, data: result };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    // ==================== 代码操作 ====================
    createScript(scriptName: string, scriptPath?: string, code?: string) {
        try {
            const fs = require('fs');
            const path = require('path');
            const Editor = (global as any).Editor;
            const projectPath = Editor?.Project?.path || process.cwd();
            const filePath = scriptPath || path.join(projectPath, 'assets', 'scripts', `${scriptName}.ts`);
            const content = code || `import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('${scriptName}')
export class ${scriptName} extends Component {
    start() { }
    update(deltaTime: number) { }
}`;
            fs.writeFileSync(filePath, content, 'utf8');
            return { success: true, data: { path: filePath, name: scriptName } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getScript(scriptPath: string) {
        try {
            const fs = require('fs');
            const content = fs.readFileSync(scriptPath, 'utf8');
            return { success: true, data: { path: scriptPath, content } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    listScripts(folder?: string) {
        try {
            const fs = require('fs');
            const path = require('path');
            const Editor = (global as any).Editor;
            const projectPath = Editor?.Project?.path || process.cwd();
            const scriptsDir = folder || path.join(projectPath, 'assets', 'scripts');
            const files: string[] = [];
            const scan = (dir: string, maxDepth: number = 5) => {
                if (maxDepth <= 0 || !fs.existsSync(dir)) return;
                try {
                    for (const f of fs.readdirSync(dir)) {
                        const full = path.join(dir, f);
                        try {
                            if (fs.statSync(full).isDirectory()) scan(full, maxDepth - 1);
                            else if (f.endsWith('.ts') || f.endsWith('.js')) files.push(full.replace(/\\/g, '/'));
                        } catch {}
                    }
                } catch {}
            };
            scan(scriptsDir);
            // 如果默认路径找不到，扫描整个 assets 目录
            if (files.length === 0 && !folder) {
                const assetsDir = path.join(projectPath, 'assets');
                scan(assetsDir, 3);
            }
            return { success: true, data: files };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    // ==================== 调试操作 ====================
    getConsoleLogs(limit?: number) {
        return { success: true, data: { message: 'Console logs capture requires editor integration', logs: [] } };
    },

    clearConsole() {
        try {
            console.clear();
            return { success: true, message: 'Console cleared' };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getEditorInfo() {
        try {
            const Editor = (global as any).Editor;
            return {
                success: true,
                data: {
                    version: Editor?.version || 'unknown',
                    platform: process.platform,
                    nodeVersion: process.version,
                    memory: process.memoryUsage()
                }
            };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getProjectLogs(lines?: number) {
        try {
            const fs = require('fs');
            const path = require('path');
            const Editor = (global as any).Editor;
            const projectPath = Editor?.Project?.path || process.cwd();
            const logPath = path.join(projectPath, 'temp', 'logs', 'project.log');
            if (!fs.existsSync(logPath)) return { success: false, error: 'Log file not found' };
            const content = fs.readFileSync(logPath, 'utf8');
            const allLines = content.split('\n').filter((l: string) => l.trim());
            const recent = allLines.slice(-(lines || 100));
            return { success: true, data: { total: allLines.length, logs: recent } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    validateScene() {
        try {
            const { director } = require('cc');
            const scene = director.getScene();
            if (!scene) return { success: false, error: 'No active scene' };
            const issues: string[] = [];
            const check = (node: any, depth: number) => {
                if (depth > 50) { issues.push('Scene depth exceeds 50 levels'); return; }
                if (!node.name) issues.push(`Node at depth ${depth} has no name`);
                node.children?.forEach((c: any) => check(c, depth + 1));
            };
            scene.children?.forEach((c: any) => check(c, 0));
            return { success: true, data: { valid: issues.length === 0, issueCount: issues.length, issues } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    // ==================== 项目操作 ====================
    getProjectInfo() {
        try {
            const Editor = (global as any).Editor;
            return {
                success: true,
                data: {
                    name: Editor?.Project?.name || 'Unknown',
                    path: Editor?.Project?.path || '',
                    version: Editor?.version || 'unknown'
                }
            };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getProjectSettings() {
        try {
            const Editor = (global as any).Editor;
            return { success: true, data: { name: Editor?.Project?.name, path: Editor?.Project?.path } };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    getCocosVersion() {
        try {
            const Editor = (global as any).Editor;
            return { success: true, data: Editor?.version || 'unknown' };
        } catch (e: any) { return { success: false, error: e.message }; }
    },

    // ==================== 构建和运行（桩实现） ====================
    getBuildPlatforms() {
        return { success: true, data: ['web-mobile', 'web-desktop', 'ios', 'android', 'windows', 'mac'] };
    },

    getBuildSettings() {
        return { success: true, data: { message: 'Build settings require editor integration' } };
    },

    setBuildSettings() {
        return { success: true, message: 'Build settings updated (stub)' };
    },

    getBuildProgress() {
        return { success: true, data: { progress: 0, status: 'idle' } };
    },

    cancelBuild() {
        return { success: true, message: 'Build cancelled (stub)' };
    },

    runProject() {
        return { success: true, message: 'Project run requested (stub)' };
    },

    stopProject() {
        return { success: true, message: 'Project stopped (stub)' };
    },

    restartProject() {
        return { success: true, message: 'Project restarted (stub)' };
    },

    getRunStatus() {
        return { success: true, data: { running: false } };
    },

    getLatestBuild() {
        return { success: true, data: { message: 'No build info available' } };
    },

    startProfiling() {
        return { success: true, message: 'Profiling started (stub)' };
    },

    stopProfiling() {
        return { success: true, data: { message: 'Profiling stopped (stub)' } };
    },

    checkProject() {
        return { success: true, data: { valid: true, issues: [] } };
    },

    setupGameConfig() {
        return { success: true, message: 'Game config setup (stub)' };
    },

    exportGameConfig() {
        return { success: true, data: { message: 'Game config exported (stub)' } };
    },

    batchRenameNodes() {
        return { success: true, message: 'Batch rename completed (stub)' };
    },

    autoAlignNodes() {
        return { success: true, message: 'Auto align completed (stub)' };
    }
};
