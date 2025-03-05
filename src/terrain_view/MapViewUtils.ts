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
     * 根据地形类型获取颜色
     */
    public static getColor(terrainType: eTerrain): THREE.Color {
        switch (terrainType) {
            case eTerrain.Ocean: return new THREE.Color(0x0000dd); // 海洋 - 蓝色
            case eTerrain.Plain: return new THREE.Color(0x00dd00); // 平原 - 绿色
            case eTerrain.Hill: return new THREE.Color(0x808000); // 丘陵 - 橄榄色
            case eTerrain.Mountain: return new THREE.Color(0x8b4513); // 山地 - 棕色
            case eTerrain.HighMountain: return new THREE.Color(0xdddddd); // 高山 - 白色
            case eTerrain.Lake: return new THREE.Color(0x00dddd); // 湖泊 - 青色
            default: return new THREE.Color(0x111111); // 未知 - 黑色
        }
    }

    /**
     * 初始化地形材质
     */
    private static initializeMaterials(): void {
        this._materials.set(eTerrain.Ocean, new THREE.MeshBasicMaterial({ color: this.getColor(eTerrain.Ocean) }));
        this._materials.set(eTerrain.Plain, new THREE.MeshBasicMaterial({ color: this.getColor(eTerrain.Plain) }));
        this._materials.set(eTerrain.Hill, new THREE.MeshBasicMaterial({ color: this.getColor(eTerrain.Hill) }));
        this._materials.set(eTerrain.Mountain, new THREE.MeshBasicMaterial({ color: this.getColor(eTerrain.Mountain) }));
        this._materials.set(eTerrain.HighMountain, new THREE.MeshBasicMaterial({ color: this.getColor(eTerrain.HighMountain) }));
        this._materials.set(eTerrain.Lake, new THREE.MeshBasicMaterial({ color: this.getColor(eTerrain.Lake) }));
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

