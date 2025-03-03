import * as THREE from 'three';
import { MapGenerator } from './MapGenerator';
import type { MapInfo, HexCellData } from './types';
import { HexGridUtils } from './HexGridUtils';

export class RenderTest {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private mapGenerator: MapGenerator;
    private mapInfo: MapInfo;

    constructor(mapInfo: MapInfo, scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.mapInfo = mapInfo;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.mapGenerator = new MapGenerator(mapInfo);

    }

    public async generateAndRenderMap(): Promise<void> {
        const mapData = await this.mapGenerator.generateMap();
        this.renderHexGrid(mapData);
    }

    private renderHexGrid(mapData: HexCellData[]): void {
        const hexSize = 1; // 六边形大小
        const hexHeight = hexSize * Math.sqrt(3);
        const geometry = new THREE.CylinderGeometry(hexSize, hexSize, 1, 6);
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        mapData.forEach(cell => {
            const { q, r, terrainType } = cell;
            const color = this.getColorByTerrain(terrainType);

            // 计算六边形中心坐标
            const x = hexSize * (3 / 2 * q);
            const z = hexHeight * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);

            // 创建六边形几何体
            material.color.set(color);
            const hexMesh = new THREE.Mesh(geometry, material);

            // 设置位置
            hexMesh.position.set(x, 0, z);
            hexMesh.rotation.x = Math.PI / 2; // 旋转使其平躺

            // 添加到场景
            this.scene.add(hexMesh);
        });

    }

    private getColorByTerrain(terrainType: number): number {
        switch (terrainType) {
            case 0: return 0x0000ff; // 海洋 - 蓝色
            case 1: return 0x00ff00; // 平原 - 绿色
            case 2: return 0x808000; // 丘陵 - 橄榄色
            case 3: return 0x8b4513; // 山地 - 棕色
            case 4: return 0xffffff; // 高山 - 白色
            case 5: return 0x00ffff; // 湖泊 - 青色
            default: return 0x000000; // 未知 - 黑色
        }
    }
}