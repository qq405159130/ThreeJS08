// src/terrain/HexGridSystem.ts
import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { HexGridUtils } from './HexGridUtils';

export class HexGridSystem {
    private cells: HexCellView[] = []; // 所有六边形网格
    private eventManager: EventManager = new EventManager(); // 事件管理器

    constructor(private scene: THREE.Scene, private camera: THREE.Camera, private renderer: THREE.WebGLRenderer) {
        this.init();
    }

    // 初始化网格
    private init(): void {
        const gridCoordinates = HexGridUtils.generateHexGrid(10, 10); // 生成10x10的六边形网格
        gridCoordinates.forEach(({ q, r }) => {
            const cell = new HexCellView(q, r, this.eventManager);
            this.cells.push(cell);
            this.scene.add(cell.mesh);
        });

        // 监听事件
        this.eventManager.on('cellHover', (cell: HexCellView) => this.handleCellHover(cell));
        this.eventManager.on('cellHoverEnd', (cell: HexCellView) => this.handleCellHoverEnd(cell));
        this.eventManager.on('cellClick', (cell: HexCellView) => this.handleCellClick(cell));

        // 绑定全局点击事件
        this.renderer.domElement.addEventListener('click', () => this.handleGlobalClick());
    }

    // 处理悬停事件
    private handleCellHover(cell: HexCellView): void {
        console.log(`Cell hovered: (${cell.q}, ${cell.r})`);
    }

    // 处理悬停结束事件
    private handleCellHoverEnd(cell: HexCellView): void {
        console.log(`Cell hover ended: (${cell.q}, ${cell.r})`);
    }

    // 处理点击事件
    private handleCellClick(cell: HexCellView): void {
        console.log(`Cell clicked: (${cell.q}, ${cell.r})`);
    }

    // 处理全局点击事件（取消选中）
    private handleGlobalClick(): void {
        this.cells.forEach(cell => cell.cancelAction());
    }
}