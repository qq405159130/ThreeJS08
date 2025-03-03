// game/src/map/TerrainMaterialSystem.ts
import * as THREE from 'three';
import { eTerrain } from '../terrain/enums';

export class TerrainMaterialSystem {
    private materials: Map<eTerrain, THREE.Material>;

    constructor() {
        this.materials = new Map();
        this.initializeMaterials();
    }

    /**
     * 初始化地形材质
     */
    private initializeMaterials(): void {
        this.materials.set(eTerrain.Ocean, new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        this.materials.set(eTerrain.Plain, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        this.materials.set(eTerrain.Hill, new THREE.MeshBasicMaterial({ color: 0x808000 }));
        this.materials.set(eTerrain.Mountain, new THREE.MeshBasicMaterial({ color: 0x8b4513 }));
        this.materials.set(eTerrain.HighMountain, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        this.materials.set(eTerrain.Lake, new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    }

    /**
     * 获取地形材质
     * @param terrainType 地形类型
     * @returns 对应的材质
     */
    public getMaterial(terrainType: eTerrain): THREE.Material {
        return this.materials.get(terrainType) || new THREE.MeshBasicMaterial({ color: 0x000000 });
    }
}