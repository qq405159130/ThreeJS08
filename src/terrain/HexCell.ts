import { ServiceManager } from '@/utils/ServiceManager';
import { eTerrain, eTerrainFace, eHeightLevel, eHumidityLevel, eBuild, eResource } from './enums';
import { HexGridUtils } from './HexGridUtils';
import type { HexCellData } from './types';

export class HexCell {
    private _data: HexCellData;

    constructor(q: number, r: number) {
        this._data = {
            q,
            r,
            height: 0,
            heightLevel: eHeightLevel.None,
            humidity: 0,
            humidityLevel: eHumidityLevel.None,
            terrainType: eTerrain.Plain,
            terrainFaceType: eTerrainFace.Grassland,
            resourceType: null,
            buildType: null,
            riverLevel: 0,
            isBridge: false,
            isRoad: false
        };
    }

    get data(): HexCellData {
        return { ...this._data };
    }

    // 高度相关操作
    setHeight(height: number, level: eHeightLevel): void {
        this._data.height = height;
        this._data.heightLevel = level;
    }

    // 湿度相关操作
    setHumidity(humidity: number, level: eHumidityLevel): void {
        this._data.humidity = Math.min(1, Math.max(0, humidity));
        this._data.humidityLevel = level;
    }

    // 地形设置
    setTerrain(terrain: eTerrain, face: eTerrainFace): void {
        this._data.terrainType = terrain;
        this._data.terrainFaceType = face;
    }

    getNeighbors(): HexCell[] {
        const cellDatas = ServiceManager.getInstance().getHexCellMgr().getCellMap();
        const neighbors = HexGridUtils.getNeighbors(this.data.q, this.data.r)
            .map(coord => cellDatas.get(`${coord.q},${coord.r}`))
            .filter(Boolean) as HexCell[];
        return neighbors;
    }

    // 其他属性的设置方法...



}