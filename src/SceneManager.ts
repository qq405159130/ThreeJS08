import * as THREE from 'three';

export enum eSceneMount {
    /** 
     * 天空盒 (skybox): 用于放置天空盒或背景。
       灯光 (lights): 包含所有灯光（如平行光、点光源、聚光灯等）。
       雾效 (fog): 如果使用雾效，可以在此节点管理。
    */
    environment = 'environment',
    /**
     * 地面 (ground): 放置地面模型或平面。
       静态物体 (staticObjects): 如建筑物、树木、岩石等不动的物体。
     */
    terrain = 'terrain',
    /**
     * 玩家角色
     */
    player = 'player',
    /**
     * 敌人角色
     */
    enemy = 'enemy',
    /**
     * 各种发射物
     */
    bullet = 'bullet',
    /**
     * 粒子系统 (particles): 如火焰、烟雾、魔法效果
     */
    effect = 'effect',
    /**
     * 2D UI (2dUI): 如HUD、菜单、提示等。
       3D UI (3dUI): 如3D文本、交互按钮等。
     */
    ui = 'ui',
    /**
     * 背景音乐 (backgroundMusic): 管理背景音乐。
     * 音效 (soundEffects): 管理环境音效、角色音效等。
     */
    audio = 'audio',
    /**
     * 辅助线 (helpers): 如坐标轴、网格辅助线等
     * 调试信息 (debugInfo): 如帧率、性能监控等。
     */
    debug = 'debug',
}

export class SceneManager {

    public static init(scene: THREE.Scene): void {
        if (this._scene) {
            console.error('\n SceneManager already initialized !');
            return;
        }
        window["__scene"] = this.scene;//方便调试
        window["__sceneManager"] = this;//方便调试
        this._scene = scene;
        //获取所有的eSceneMount
        var keys = Object.keys(eSceneMount);
        keys.forEach(key => {
            // var value = eSceneMount[key];
            var value = key as eSceneMount;
            if (typeof value === 'string') {
                var mount = this.createMountPoint(value);
                mount.name = value;
            }
        });
        console.warn('\n SceneManager initialized complete ');
    }

    private static _scene: THREE.Scene;

    private static mountPoints: Record<string, THREE.Group> = {};

    // 创建挂载点
    private static createMountPoint(name: eSceneMount): THREE.Group {
        const group = new THREE.Group();
        group.name = name;
        this._scene.add(group);
        this.mountPoints[name] = group;
        return group;
    }

    // 获取挂载点
    public static get(name: eSceneMount): THREE.Group {
        return this.mountPoints[name];
    }

    // 清空挂载点
    private static clearMountPoint(name: eSceneMount) {
        const group = this.get(name);
        if (group) {
            while (group.children.length > 0) {
                group.remove(group.children[0]);
            }
        }
    }
}

