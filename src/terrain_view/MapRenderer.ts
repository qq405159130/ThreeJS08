// game/src/map/MapRenderer.ts
import * as THREE from 'three';
import { HexCellData } from '../terrain/types';
import { MapDynamicLoadingSystem } from './MapDynamicLoadingSystem';
import { MapLODSystem } from './MapLODSystem';
import { MapGenerator } from '@/terrain/MapGenerator';
import { HexCellView } from '@/terrain_interact/HexCellView';
import { EventManager } from '../utils/EventManager';

export class MapRenderer {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private dynamicLoadingSystem: MapDynamicLoadingSystem;
    private lodSystem: MapLODSystem;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, private eventManager: EventManager) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // 初始化子系统
        this.dynamicLoadingSystem = new MapDynamicLoadingSystem(scene);
        this.lodSystem = new MapLODSystem(scene, camera);
    }

    /**
     * 渲染地图
     * @param mapData 地图数据
     */
    public renderMap(mapData: HexCellData[]): void {
        mapData.forEach(cellData => {
            // const cellView = new HexCellView(cellData.q, cellData.r, cellData);
            // cellView.init(this.eventManager);
            // this.cellViews.set(`${cellData.q},${cellData.r}`, cellView);
            // this.scene.add(cellView.mesh);

            //暂时屏蔽这两个系统的使用；
            // this.dynamicLoadingSystem.addCell(cell, mesh);
            // this.lodSystem.addMesh(mesh);
        });
    }

    /**
     * 更新地图（动态加载和卸载）
     */
    public updateMap(): void {
        //暂时屏蔽这两个系统的使用；
        // this.dynamicLoadingSystem.update(this.camera.position);
        // this.lodSystem.update();
    }

    
}