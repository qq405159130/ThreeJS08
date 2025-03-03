// src/terrain/HexGridSystem.ts
import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { HexGridUtils } from './HexGridUtils';

export class HexGridSystem {
    private cells: HexCellView[] = []; // 所有六边形网格
    private eventManager: EventManager = new EventManager(); // 事件管理器
    private raycaster: THREE.Raycaster = new THREE.Raycaster(); // 光线投射器
    private mouse: THREE.Vector2 = new THREE.Vector2(); // 鼠标位置
    private hoveredCell: HexCellView | null = null; // 当前悬停的单元格

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

        // 绑定鼠标移动事件
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    // 处理鼠标移动事件
    private onMouseMove(event: MouseEvent): void {
        // 将鼠标位置归一化为设备坐标（-1到+1）
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 更新光线投射器
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 检测与网格的交互
        const intersects = this.raycaster.intersectObjects(this.cells.map(cell => cell.mesh));
        if (intersects.length > 0) {
            const intersectedCell = this.cells.find(cell => cell.mesh === intersects[0].object);
            if (intersectedCell && intersectedCell !== this.hoveredCell) {
                if (this.hoveredCell) {
                    this.hoveredCell.onHoverEnd(); // 结束上一个悬停
                }
                intersectedCell.onHover(); // 开始新的悬停
                this.hoveredCell = intersectedCell;
            }
        } else if (this.hoveredCell) {
            this.hoveredCell.onHoverEnd(); // 结束悬停
            this.hoveredCell = null;
        }
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