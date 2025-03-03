import { eTerrain, eTerrainFace, eHeightLevel, eHumidityLevel, eBuild, eResource } from './enums';

export type HexCellData = {
    q: number;
    r: number;
    height: number;
    heightLevel: eHeightLevel;
    humidity: number;
    humidityLevel: eHumidityLevel;
    terrainType: eTerrain;
    terrainFaceType: eTerrainFace;
    resourceType: eResource | null;
    buildType: eBuild | null;
    riverLevel: number;
    isBridge: boolean;
    isRoad: boolean;
};

export type MapInfo = {
    width: number;
    height: number;
    oceanRatio: number;
    mountainRatio: number;
    forestRatio: number;
    desertRatio: number;
    snowRatio: number;
    minCities: number;
    maxCities: number;
};