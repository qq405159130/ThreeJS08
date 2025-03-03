// game/src/map/DynamicLoadingSystem.ts
import * as THREE from 'three';
import { HexCellData } from '../terrain/types';

export class MapDynamicLoadingSystem {
    private scene: THREE.Scene;
    private loadedCells: Map<string, THREE.Mesh>;
    private loadingDistance: number = 10; // 加载距离

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.loadedCells = new Map();
    }

    /**
     * 添加单元格
     * @param cell 单元格数据
     * @param mesh 对应的网格
     */
    public addCell(cell: HexCellData, mesh: THREE.Mesh): void {
        const key = `${cell.q},${cell.r}`;
        this.loadedCells.set(key, mesh);
    }

    /**
     * 更新动态加载
     * @param cameraPosition 摄像机位置
     */
    public update(cameraPosition: THREE.Vector3): void {
        this.loadedCells.forEach((mesh, key) => {
            const distance = mesh.position.distanceTo(cameraPosition);
            if (distance > this.loadingDistance) {
                this.scene.remove(mesh);
                this.loadedCells.delete(key);
            }
        });
    }
}