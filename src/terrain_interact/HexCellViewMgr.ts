import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { HexCellData } from '@/terrain/types';

export class HexCellViewMgr {
    private cellViews: Map<string, HexCellView> = new Map();
    private eventManager: EventManager;

    constructor(eventManager: EventManager) {
        this.eventManager = eventManager;
    }

    // 添加或更新单元格视图
    public addOrUpdateCellView(q: number, r: number, cellData: HexCellData): HexCellView {
        const key = `${q},${r}`;
        let cellView = this.cellViews.get(key);
        if (!cellView) {
            cellView = new HexCellView(q, r, cellData);
            this.cellViews.set(key, cellView);
            cellView.init(this.eventManager);
        }
        return cellView;
    }

    // 获取单元格视图
    public getCellView(q: number, r: number): HexCellView | undefined {
        return this.cellViews.get(`${q},${r}`);
    }

    // 获取所有单元格视图
    public getAllCellViews(): HexCellView[] {
        return Array.from(this.cellViews.values());
    }

    // 清除所有单元格视图
    public clear(): void {
        this.cellViews.clear();
    }
}