import * as THREE from 'three';
import { MapGenerator } from './MapGenerator';
import { HexGridInteractSystem } from '../terrain_interact/HexGridInteractSystem';
import { HexCellMgr } from './HexCellMgr';
import { HexCellViewMgr } from '../terrain_interact/HexCellViewMgr';
import { EventManager } from '../utils/EventManager';
import { MapInfo } from './types';

export class MapMainConstructor {
    private mapGenerator: MapGenerator;
    private hexGridInteractSystem: HexGridInteractSystem;
    private hexCellMgr: HexCellMgr;
    private hexCellViewMgr: HexCellViewMgr;
    private eventManager: EventManager;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, mapInfo: MapInfo) {
        this.eventManager = new EventManager();
        this.hexCellMgr = new HexCellMgr();
        this.hexCellViewMgr = new HexCellViewMgr(scene);
        this.mapGenerator = new MapGenerator(mapInfo);
        this.hexGridInteractSystem = new HexGridInteractSystem(scene, camera, renderer, this.eventManager);
    }

    // 初始化地图
    public async initializeMap(): Promise<void> {
        this.hexCellMgr.clear();
        this.hexCellViewMgr.clear();
        const mapData = await this.mapGenerator.generateMap();

        let isNew = true;
        if (isNew)
        {
            mapData.forEach(cellData => {
                // const cell = new HexCell(q, r);
                // const cell = this.hexCellMgr.addOrUpdateCell(cellData.q, cellData.r, cellData);
                const cellView = this.hexCellViewMgr.addOrUpdateCellView(cellData.q, cellData.r, cellData);
            });
        }
        // else
        // {
        //     this.mapRenderer.renderMap(mapData);
        // }
    }

    // 更新地图
    public updateMap(): void {
        this.hexGridInteractSystem.update();
    }

    // 获取HexCellMgr
    public getHexCellMgr(): HexCellMgr {
        return this.hexCellMgr;
    }

    // 获取HexCellViewMgr
    public getHexCellViewMgr(): HexCellViewMgr {
        return this.hexCellViewMgr;
    }

    // 获取MapGenerator
    public getMapGenerator(): MapGenerator {
        return this.mapGenerator;
    }

    // 获取HexGridInteractSystem
    public getHexGridInteractSystem(): HexGridInteractSystem {
        return this.hexGridInteractSystem;
    }

    // 获取EventManager
    public getEventManager(): EventManager {
        return this.eventManager;
    }
}