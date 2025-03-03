import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { HexCellData } from '@/terrain/types';

export class HexCellViewMgr {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private cellViews: Map<string, HexCellView> = new Map();
    private eventManager: EventManager;

    public getCellViews(): Map<string, HexCellView>
    {
        return this.cellViews;
    }

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, eventManager: EventManager) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.eventManager = eventManager;
    }

    // 添加或更新单元格视图
    public addOrUpdateCellView(q: number, r: number, cellData: HexCellData): HexCellView {
        const key = `${q},${r}`;
        let cellView = this.cellViews.get(key);
        if (!cellView) {
            cellView = new HexCellView(q, r, cellData);
            cellView.init(this.eventManager);
            this.cellViews.set(key, cellView);
            this.scene.add(cellView.mesh);
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