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
        // console.warn("addOrUpdateCell  ID: " + this.ID);
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
}