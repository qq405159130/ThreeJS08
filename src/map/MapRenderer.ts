// game/src/map/MapRenderer.ts
import * as THREE from 'three';
import { HexCellData } from '../terrain/types';
import { TerrainMaterialSystem } from './TerrainMaterialSystem';
import { DynamicLoadingSystem } from './DynamicLoadingSystem';
import { LODSystem } from './LODSystem';

export class MapRenderer {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private terrainMaterialSystem: TerrainMaterialSystem;
    private dynamicLoadingSystem: DynamicLoadingSystem;
    private lodSystem: LODSystem;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // 初始化子系统
        this.terrainMaterialSystem = new TerrainMaterialSystem();
        this.dynamicLoadingSystem = new DynamicLoadingSystem(scene);
        this.lodSystem = new LODSystem(scene, camera);
    }

    /**
     * 渲染地图
     * @param mapData 地图数据
     */
    public renderMap(mapData: HexCellData[]): void {
        mapData.forEach(cell => {
            const mesh = this.createHexMesh(cell);
            this.scene.add(mesh);
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

    /**
     * 创建六边形网格
     * @param cell 六边形单元格数据
     * @returns 六边形网格
     */
    private createHexMesh(cell: HexCellData): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 6);
        const material = this.terrainMaterialSystem.getMaterial(cell.terrainType);
        const mesh = new THREE.Mesh(geometry, material);
        // mesh.renderOrder = 1; // 设置一个较高的渲染顺序

        const x = 1.5 * cell.q;
        const z = Math.sqrt(3) * (cell.r + cell.q / 2);
        mesh.position.set(x, 0, z);
        // console.warn('Created Hex Mesh:', mesh); // 打印网格信息
        return mesh;
    }
}