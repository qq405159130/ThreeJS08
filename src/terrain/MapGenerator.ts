import { HexGridUtils } from './HexGridUtils';
import { NoiseGenerator } from './NoiseGenerator';
import { HexCell } from './HexCell';
import {
    eTerrain, eTerrainFace, eHeightLevel, eHumidityLevel, eBuild, eResource
} from './enums';
import type { MapInfo, HexCellData } from './types';
import { ServiceManager } from '@/utils/ServiceManager';
import { NoiseTextureLoader } from './NoiseTextureLoader';
import { logExecutionTime } from '@/_decorator/logExecutionTime';
import { MapStatistics } from '@/terrain_statistics/TerrainStatsTypes';
import { MapStatisticsCoordinator } from '@/terrain_statistics/MapStatisticsCoordinator';
import { StatisticsLogger } from '@/terrain_statistics/StatisticsLogger';

export class MapGenerator {
    private get cellDatas(): Map<string, HexCell> {
        return ServiceManager.getInstance().getHexCellMgr().getCellMap();
    }
    private mapInfo: MapInfo;
    private heightThresholds: { height1: number; height2: number; height3: number; height4: number };

    constructor(mapInfo: MapInfo) {
        this.mapInfo = mapInfo;
        this.heightThresholds = { height1: 0, height2: 0, height3: 0, height4: 0 };
    }

    private initializeGrid(): void {
        const coordinates = HexGridUtils.generateHexGrid(
            this.mapInfo.width,
            this.mapInfo.height
        );

        coordinates.forEach(({ q, r }) => {
            // const cell = new HexCell(q, r);
            // this.cellDatas.set(`${q},${r}`, cell);
            const cell = ServiceManager.getInstance().getHexCellMgr().addOrUpdateCell(q, r);
        });
    }

    @logExecutionTime("生成地图")
    public async generateMap(): Promise<HexCellData[]> {

        this.initializeGrid();

        await this.generateHeightMap('json');
        await this.classifyTerrain();
        await this.generateRivers();
        await this.generateClimate();
        await this.generateTerrainFace();
        await this.generateResources();
        await this.generateCities();
        this.showStatistics();
        return Array.from(this.cellDatas.values()).map(cell => cell.data);
    }


    @logExecutionTime("生成高度图")
    public async generateHeightMap(mode: 'noise' | 'json' = 'noise'): Promise<void> {
        if (mode === 'noise') {
            const noisePath = process.env.NODE_ENV === 'production' ? '/noise.png' : '../public/noise.png';
            await this.generateHeightMapFromNoise(noisePath);
        } else if (mode === 'json') {
            const jsonPath = process.env.NODE_ENV === 'production' ? '/map_data.json' : '../public/map_data.json'; // JSON 文件路径
            await this.generateHeightMapFromJSON(jsonPath);
        } else {
            throw new Error('Invalid mode. Supported modes are "noise" and "json".');
        }
    }

    private async generateHeightMapFromNoise(noisePath: string): Promise<void> {
        const width = this.mapInfo.width;
        const height = this.mapInfo.height;

        // const noiseGen = new NoiseGenerator();
        // const noiseMap = noiseGen.generateNoiseMap(
        //     width,
        //     height,
        //     0.1, // scale
        //     6,   // octaves
        //     0.5, // persistence
        //     2.0  // lacunarity
        // );
        const noiseGen = new NoiseTextureLoader();
        await noiseGen.loadNoiseTexture(noisePath);
        // await noiseGen.loadNoiseTexture('../public/noise.png');//本地能加载成功。
        // await noiseGen.loadNoiseTexture('/noise.png');//本地也加载失败了；
        const noiseMap = await noiseGen.generateNoiseMap(width, height);

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

    private async generateHeightMapFromJSON(jsonPath: string): Promise<void> {
        const response = await fetch(jsonPath);
        const data = await response.json();

        // 遍历 JSON 数据，设置单元格高度
        data.forEach((cellData: { x: number; y: number; height: number }) => {
            const cell = this.cellDatas.get(`${cellData.x},${cellData.y}`);
            if (cell) {
                // 将高度值映射到 0~1 范围（假设 JSON 中的高度是 0~255）
                const heightValue = cellData.height / 255;
                cell.setHeight(heightValue, this.getHeightLevel(heightValue));
            }
        });
    }

    private getHeightLevel(heightValue: number): eHeightLevel {
        if (heightValue < this.heightThresholds.height1) {
            return eHeightLevel.None;
        } else if (heightValue < this.heightThresholds.height2) {
            return eHeightLevel.Level1;
        } else if (heightValue < this.heightThresholds.height3) {
            return eHeightLevel.Level2;
        } else if (heightValue < this.heightThresholds.height4) {
            return eHeightLevel.Level3;
        } else {
            return eHeightLevel.Level4;
        }
    }

    @logExecutionTime("生成地形")
    private async classifyTerrain(): Promise<void> {
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

    @logExecutionTime("生成河流")
    private async generateRivers(): Promise<void> {
        const mountainCells = Array.from(this.cellDatas.values()).filter(
            cell => cell.data.terrainType === eTerrain.HighMountain
        );

        mountainCells.forEach(cell => {
            if (Math.random() < 0.2) { // 20% 的高山生成河流
                this.generateRiverFromCell(cell);
            }
        });
    }

    @logExecutionTime("生成一条河流")
    private async generateRiverFromCell(startCell: HexCell): Promise<void> {
        let currentCell = startCell;
        const visitedCells = new Set<string>(); // 记录已经访问过的单元格
        const maxIterations = 100; // 最大迭代次数，防止无限循环
        let iterations = 0;

        while (currentCell.data.terrainType !== eTerrain.Ocean && iterations < maxIterations) {
            // 标记当前单元格为河流
            currentCell.data.riverLevel = 1;

            // 记录当前单元格已被访问
            visitedCells.add(`${currentCell.data.q},${currentCell.data.r}`);

            // 获取当前单元格的邻居单元格
            const neighbors = currentCell.getNeighbors();

            // 找到高度最低的邻居单元格
            let nextCell = neighbors.reduce((lowest, cell) =>
                cell.data.height < lowest.data.height ? cell : lowest
            );

            // 检查是否到达局部最低点
            if (nextCell.data.height >= currentCell.data.height) {
                break; // 没有更低的地形，停止生成河流
            }

            // 检查是否进入环形区域
            if (visitedCells.has(`${nextCell.data.q},${nextCell.data.r}`)) {
                break; // 已经访问过该单元格，停止生成河流
            }

            // 更新当前单元格
            currentCell = nextCell;
            iterations++;
            // 如果达到最大迭代次数，记录警告
            if (iterations >= maxIterations) {
                console.warn('River generation reached max iterations. Possible infinite loop.');
                break;
            }
        }

    }

    @logExecutionTime("生成气候带")
    private async generateClimate(): Promise<void> {
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
            const neighbors = cell.getNeighbors();
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

    @logExecutionTime("生成地貌")
    private async generateTerrainFace(): Promise<void> {
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

    @logExecutionTime("生成资源")
    private async generateResources(): Promise<void> {
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

    @logExecutionTime("生成城市")
    private async generateCities(): Promise<void> {
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
        const neighbors = cityCell.getNeighbors();
        neighbors.forEach(neighbor => {
            if (neighbor.data.terrainType !== eTerrain.Ocean && Math.random() < 0.5) {
                neighbor.data.isRoad = true;
            }
        });
    }

    private statisticsCoordinator = new MapStatisticsCoordinator();
    private getStatistics(): MapStatistics {
        const cells = Array.from(this.cellDatas.values());
        return this.statisticsCoordinator.generate(cells);
    }

    private showStatistics(): void {
        const stats = this.getStatistics();
        StatisticsLogger.log(stats);
    }
}