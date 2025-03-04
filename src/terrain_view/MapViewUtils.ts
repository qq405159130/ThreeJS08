// game/src/map/TerrainMaterialSystem.ts
import * as THREE from 'three';
import { eTerrain } from '../terrain/enums';

export class MapViewUtils {

    private static _initialized: boolean = false;
    private static _materials: Map<eTerrain, THREE.Material> = new Map();

    private static hexGeometryCache: THREE.BufferGeometry | null = null;

    public static getHexGeometry(): THREE.BufferGeometry {
        if (!this.hexGeometryCache) {
            this.hexGeometryCache = new THREE.CylinderGeometry(1, 1, 0.1, 6); // 六边形几何体
        }
        return this.hexGeometryCache;
    }

    /**
     * 初始化地形材质
     */
    private static initializeMaterials(): void {
        this._materials.set(eTerrain.Ocean, new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        this._materials.set(eTerrain.Plain, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        this._materials.set(eTerrain.Hill, new THREE.MeshBasicMaterial({ color: 0x808000 }));
        this._materials.set(eTerrain.Mountain, new THREE.MeshBasicMaterial({ color: 0x8b4513 }));
        this._materials.set(eTerrain.HighMountain, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        this._materials.set(eTerrain.Lake, new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    }

    /**
     * 获取地形材质
     * @param terrainType 地形类型
     * @returns 对应的材质
     */
    public static getMaterial(terrainType: eTerrain): THREE.Material {
        if (!this._initialized) {
            this.initializeMaterials();
            this._initialized = true;
        }
        return this._materials.get(terrainType) || new THREE.MeshBasicMaterial({ color: 0x000000 });
    }


}

