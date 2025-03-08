import { Hex } from 'honeycomb-grid';
import { HexCell } from './HexCell';
import { HexCellData } from './types';
import { eTerrain } from './enums';

export class HexCellMgr {
    private ID: number = 0;
    private cells: Map<string, HexCell> = new Map();

    constructor() { }

    // 添加或更新单元格
    public addOrUpdateCell(q: number, r: number, data?: HexCellData): HexCell {
        const key = `${q},${r}`;
        let cell = this.cells.get(key);
        if (!cell) {
            cell = new HexCell(q, r);
            this.cells.set(key, cell);
        }
        if (data) {
            cell.setHeight(data.height, data.heightLevel);
            cell.setHumidity(data.humidity, data.humidityLevel);
            cell.setTerrain(data.terrainType, data.terrainFaceType);
            cell.data.resourceType = data.resourceType;
            cell.data.buildType = data.buildType;
            cell.data.riverLevel = data.riverLevel;
            cell.data.isBridge = data.isBridge;
            cell.data.isRoad = data.isRoad;
        }
        this.ID++;
        return cell;
    }

    // 获取单元格
    public getCell(q: number, r: number): HexCell | undefined {
        return this.cells.get(`${q},${r}`);
    }

    // 获取所有单元格
    public getAllCells(): HexCell[] {
        return Array.from(this.cells.values());
    }

    public getCellMap(): Map<string, HexCell> {
        return this.cells;
    }

    /** 获取特定类型的格子 */
    public getCellsByTypes(types: eTerrain[]): HexCell[] {
        return Array.from(this.cells.values()).filter((cell: HexCell) => {
            return types.indexOf(cell.data.terrainType) !== -1;
        });
    }

    // 清除所有单元格
    public clear(): void {
        this.cells.clear();
    }

    // 导出 HexCell 数据为 JSON 格式
    public exportToJson(): string {
        const cellsArray = Array.from(this.cells.values()).map(cell => ({
            x: cell.data.q,
            y: cell.data.r,
            terrain: cell.data.terrainType,
            // height: cell.data.height,
            // humidity: cell.data.humidity,
            // resourceType: cell.data.resourceType,
            // buildType: cell.data.buildType,
            // riverLevel: cell.data.riverLevel,
            // isBridge: cell.data.isBridge,
            // isRoad: cell.data.isRoad
        }));

        return JSON.stringify(cellsArray, null, 2);
    }

    // 导出为 CSV 格式
    public exportToCsv(): string {
        const headers = [
            'x', 'y', 'terrain', 'height',
            //  'humidity', 'resourceType', 'buildType', 'riverLevel', 'isBridge', 'isRoad'
        ].join(',');

        const rows = Array.from(this.cells.values()).map(cell => [
            cell.data.q,
            cell.data.r,
            cell.data.terrainType,
            // cell.data.height,
            // cell.data.humidity,
            // cell.data.resourceType || '',
            // cell.data.buildType || '',
            // cell.data.riverLevel,
            // cell.data.isBridge,
            // cell.data.isRoad
        ].join(','));

        return [headers, ...rows].join('\n');
    }
}