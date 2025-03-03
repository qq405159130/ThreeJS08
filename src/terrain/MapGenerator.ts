import { HexGridUtils } from './HexGridUtils';
import { NoiseGenerator } from './NoiseGenerator';
import { HexCell } from './HexCell';
import {
    eTerrain, eTerrainFace, eHeightLevel, eHumidityLevel, eBuild, eResource
} from './enums';
import type { MapInfo, HexCellData } from './types';
import { HexCellView } from '@/terrain_interact/HexCellView';

export class MapGenerator {
    private cellDatas: Map<string, HexCell> = new Map();
    private mapInfo: MapInfo;
    private heightThresholds: { height1: number; height2: number; height3: number; height4: number };

    constructor(mapInfo: MapInfo) {
        this.mapInfo = mapInfo;
        this.heightThresholds = { height1: 0, height2: 0, height3: 0, height4: 0 };
        this.initializeGrid();
    }

    private initializeGrid(): void {
        const coordinates = HexGridUtils.generateHexGrid(
            this.mapInfo.width,
            this.mapInfo.height
        );

        coordinates.forEach(({ q, r }) => {
            const cell = new HexCell(q, r);
            this.cellDatas.set(`${q},${r}`, cell);

            // const cellView = new HexCellView(q, r);
            // this.cellViews.set(`${q},${r}`, cellView);
        });
    }

    async generateMap(): Promise<HexCellData[]> {
        await this.generateHeightMap();
        this.classifyTerrain();
        this.generateRivers();
        this.generateClimate();
        this.generateTerrainFace();
        this.generateResources();
        this.generateCities();

        return Array.from(this.cellDatas.values()).map(cell => cell.data);
    }

    private async generateHeightMap(): Promise<void> {
        const noiseGen = new NoiseGenerator();
        const width = this.mapInfo.width;
        const height = this.mapInfo.height;

        const noiseMap = noiseGen.generateNoiseMap(
            width,
            height,
            0.1, // scale
            6,   // octaves
            0.5, // persistence
            2.0  // lacunarity
        );

        // 计算高度等级阈值
        const sortedHeights = [...noiseMap].sort((a, b) => a - b);
        this.heightThresholds.height1 = sortedHeights[Math.floor(sortedHeights.length * this.mapInfo.oceanRatio)];
        this.heightThresholds.height4 = sortedHeights[Math.floor(sortedHeights.length * (1 - this.mapInfo.mountainRatio))];
        this.heightThresholds.height2 = this.heightThresholds.height1 + (this.heightThresholds.height4 - this.heightThresholds.height1) * 0.33;
        this.heightThresholds.height3 = this.heightThresholds.height1 + (this.heightThresholds.height4 - this.heightThresholds.height1) * 0.66;

        // 应用高度等级到单元格
        this.cellDatas.forEach(cell => {
            const idx = cell.data.q * height + cell.data.r;
            const heightValue = noiseMap[idx];

            let level: eHeightLevel;
            if (heightValue < this.heightThresholds.height1) {
                level = eHeightLevel.None;
            } else if (heightValue < this.heightThresholds.height2) {
                level = eHeightLevel.Level1;
            } else if (heightValue < this.heightThresholds.height3) {
                level = eHeightLevel.Level2;
            } else if (heightValue < this.heightThresholds.height4) {
                level = eHeightLevel.Level3;
            } else {
                level = eHeightLevel.Level4;
            }

            cell.setHeight(heightValue, level);
        });
    }

    private classifyTerrain(): void {
        this.cellDatas.forEach(cell => {
            const { heightLevel, height } = cell.data;
            let terrain: eTerrain;

            switch (heightLevel) {
                case eHeightLevel.None:
                    terrain = eTerrain.Ocean;
                    break;
                case eHeightLevel.Level1:
                    terrain = eTerrain.Plain;
                    break;
                case eHeightLevel.Level2:
                    terrain = Math.random() < 0.5 ? eTerrain.Hill : eTerrain.Plain;
                    break;
                case eHeightLevel.Level3:
                    terrain = Math.random() < 0.5 ? eTerrain.Mountain : eTerrain.Hill;
                    break;
                case eHeightLevel.Level4:
                    terrain = Math.random() < 0.8 ? eTerrain.HighMountain : eTerrain.Mountain;
                    break;
                default:
                    terrain = eTerrain.Plain;
            }

            cell.setTerrain(terrain, eTerrainFace.Grassland); // 默认地貌为草原
        });
    }

    private generateRivers(): void {
        const mountainCells = Array.from(this.cellDatas.values()).filter(
            cell => cell.data.terrainType === eTerrain.HighMountain
        );

        mountainCells.forEach(cell => {
            if (Math.random() < 0.2) { // 20% 的高山生成河流
                this.generateRiverFromCell(cell);
            }
        });
    }

    private generateRiverFromCell(startCell: HexCell): void {
        let currentCell = startCell;
        while (currentCell.data.terrainType !== eTerrain.Ocean) {
            currentCell.data.riverLevel = 1;
            const neighbors = HexGridUtils.getNeighbors(currentCell.data.q, currentCell.data.r)
                .map(coord => this.cellDatas.get(`${coord.q},${coord.r}`))
                .filter(Boolean) as HexCell[];

            const nextCell = neighbors.reduce((lowest, cell) =>
                cell.data.height < lowest.data.height ? cell : lowest
            );

            if (nextCell === currentCell) break; // 没有更低的地形
            currentCell = nextCell;
        }
    }

    private generateClimate(): void {
        const { width, height } = this.mapInfo;
        const latitudeBands = 5; // 将地图分为5个纬度带

        this.cellDatas.forEach(cell => {
            const lat = Math.abs(cell.data.r) / height; // 纬度比例
            const latBand = Math.floor(lat * latitudeBands);

            // 根据纬度带设置基础湿度
            let baseHumidity = 0.5;
            if (latBand === 0) baseHumidity = 0.8; // 赤道高湿度
            if (latBand === latitudeBands - 1) baseHumidity = 0.2; // 极地低湿度

            // 根据水源调整湿度
            const neighbors = HexGridUtils.getNeighbors(cell.data.q, cell.data.r)
                .map(coord => this.cellDatas.get(`${coord.q},${coord.r}`))
                .filter(Boolean) as HexCell[];

            const waterSources = neighbors.filter(
                neighbor => neighbor.data.terrainType === eTerrain.Ocean || neighbor.data.terrainType === eTerrain.Lake
            );

            const humidity = waterSources.reduce((max, source) =>
                Math.max(max, source.data.humidity * 0.8), baseHumidity
            );

            const humidityLevel = humidity < 0.3 ? eHumidityLevel.Low :
                humidity < 0.6 ? eHumidityLevel.Medium :
                    humidity < 0.9 ? eHumidityLevel.High : eHumidityLevel.Full;

            cell.setHumidity(humidity, humidityLevel);
        });
    }

    private generateTerrainFace(): void {
        this.cellDatas.forEach(cell => {
            const { terrainType, humidityLevel, heightLevel } = cell.data;
            let face: eTerrainFace;

            if (terrainType === eTerrain.Ocean) {
                face = eTerrainFace.Grassland; // 海洋无地貌
            } else if (terrainType === eTerrain.Plain) {
                if (humidityLevel === eHumidityLevel.High) {
                    face = eTerrainFace.Forest;
                } else if (humidityLevel === eHumidityLevel.Low) {
                    face = eTerrainFace.Desert;
                } else {
                    face = eTerrainFace.Grassland;
                }
            } else if (terrainType === eTerrain.Hill) {
                face = humidityLevel === eHumidityLevel.High ? eTerrainFace.Forest : eTerrainFace.Grassland;
            } else if (terrainType === eTerrain.Mountain) {
                face = heightLevel === eHeightLevel.Level4 ? eTerrainFace.Volcano : eTerrainFace.Tundra;
            } else if (terrainType === eTerrain.HighMountain) {
                face = eTerrainFace.Snow;
            } else if (terrainType === eTerrain.Lake) {
                face = eTerrainFace.Swamp;
            } else {
                face = eTerrainFace.Grassland;
            }

            cell.setTerrain(cell.data.terrainType, face);
        });
    }

    private generateResources(): void {
        this.cellDatas.forEach(cell => {
            const { terrainFaceType } = cell.data;
            let resource: eResource | null = null;

            switch (terrainFaceType) {
                case eTerrainFace.Forest:
                    resource = eResource.Forest;
                    break;
                case eTerrainFace.Desert:
                    if (Math.random() < 0.1) resource = eResource.Mineral;
                    break;
                case eTerrainFace.Grassland:
                    if (Math.random() < 0.2) resource = eResource.Agriculture;
                    break;
                case eTerrainFace.Swamp:
                    if (Math.random() < 0.3) resource = eResource.Fish;
                    break;
            }

            cell.data.resourceType = resource;
        });
    }

    private generateCities(): void {
        const plainCells = Array.from(this.cellDatas.values()).filter(
            cell => cell.data.terrainType === eTerrain.Plain && cell.data.riverLevel > 0
        );

        // 如果没有符合条件的单元格，直接返回
        if (plainCells.length === 0) {
            console.warn('No valid cells found for city generation.');
            return;
        }

        const cityCount = Math.floor(
            Math.random() * (this.mapInfo.maxCities - this.mapInfo.minCities + 1) + this.mapInfo.minCities
        );

        // 确保城市数量不超过可用单元格数量
        const actualCityCount = Math.min(cityCount, plainCells.length);
        console.warn('Generating', actualCityCount, 'cities...');
        for (let i = 0; i < actualCityCount; i++) {
            const index = Math.floor(Math.random() * plainCells.length);
            const cell = plainCells[index];
            if (!cell) {
                console.error('Invalid cell at index:', index);
                continue;
            }

            cell.data.buildType = i === 0 ? eBuild.PrimaryCity :
                Math.random() < 0.3 ? eBuild.SecondaryCity : eBuild.TertiaryCity;
            this.generateRoadsAroundCity(cell);

            // 从 plainCells 中移除已选择的单元格，避免重复生成城市
            plainCells.splice(index, 1);
        }
    }

    private generateRoadsAroundCity(cityCell: HexCell): void {
        const neighbors = HexGridUtils.getNeighbors(cityCell.data.q, cityCell.data.r)
            .map(coord => this.cellDatas.get(`${coord.q},${coord.r}`))
            .filter(Boolean) as HexCell[];

        neighbors.forEach(neighbor => {
            if (neighbor.data.terrainType !== eTerrain.Ocean && Math.random() < 0.5) {
                neighbor.data.isRoad = true;
            }
        });
    }
}