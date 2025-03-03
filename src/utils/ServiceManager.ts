import * as THREE from 'three';
import { HexCellMgr } from '../terrain/HexCellMgr';
import { HexCellViewMgr } from '../terrain_interact/HexCellViewMgr';
import { MapGenerator } from '../terrain/MapGenerator';
import { MapRenderer } from '../terrain_view/MapRenderer';
import { HexGridInteractSystem } from '../terrain_interact/HexGridInteractSystem';
import { EventManager } from './EventManager';
import { MapMainConstructor } from '../terrain/MapMainConstructor';
import { MapInfo } from '@/terrain/types';

export class ServiceManager {
    private static instance: ServiceManager;
    private mapMainConstructor: MapMainConstructor | null = null;

    private constructor() { }

    // 获取单例实例
    public static getInstance(): ServiceManager {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }

    public async initialize(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): Promise<void> {

        // 地图生成参数
        const mapInfo: MapInfo = {
            width: 5,
            height: 2,
            oceanRatio: 0.3,
            mountainRatio: 0.15,
            forestRatio: 0.2,
            desertRatio: 0.1,
            snowRatio: 0.1,
            minCities: 3,
            maxCities: 6
        };
        this.mapMainConstructor = new MapMainConstructor(scene, camera, renderer, mapInfo);

        await this.mapMainConstructor.initializeMap();
    }

    public updateFrame(): void {
        this.mapMainConstructor?.updateMap();
    }

    public getMapMainConstructor(): MapMainConstructor {
        if (!this.mapMainConstructor) {
            throw new Error('MapMainConstructor is not initialized');
        }
        return this.mapMainConstructor;
    }

    // 获取HexCellMgr
    public getHexCellMgr(): HexCellMgr {
        if (!this.mapMainConstructor) {
            throw new Error('MapMainConstructor is not initialized');
        }
        return this.mapMainConstructor.getHexCellMgr();
    }

    // 获取HexCellViewMgr
    public getHexCellViewMgr(): HexCellViewMgr {
        if (!this.mapMainConstructor) {
            throw new Error('MapMainConstructor is not initialized');
        }
        return this.mapMainConstructor.getHexCellViewMgr();
    }

    // 获取MapGenerator
    public getMapGenerator(): MapGenerator {
        if (!this.mapMainConstructor) {
            throw new Error('MapMainConstructor is not initialized');
        }
        return this.mapMainConstructor.getMapGenerator();
    }

    // 获取MapRenderer
    public getMapRenderer(): MapRenderer {
        if (!this.mapMainConstructor) {
            throw new Error('MapMainConstructor is not initialized');
        }
        return this.mapMainConstructor.getMapRenderer();
    }

    // 获取HexGridInteractSystem
    public getHexGridInteractSystem(): HexGridInteractSystem {
        if (!this.mapMainConstructor) {
            throw new Error('MapMainConstructor is not initialized');
        }
        return this.mapMainConstructor.getHexGridInteractSystem();
    }

    // 获取EventManager
    public getEventManager(): EventManager {
        if (!this.mapMainConstructor) {
            throw new Error('MapMainConstructor is not initialized');
        }
        return this.mapMainConstructor.getEventManager();
    }
}