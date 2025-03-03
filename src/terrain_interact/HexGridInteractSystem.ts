import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { HexGridUtils } from '../terrain/HexGridUtils';
import { MapGenerator } from '@/terrain/MapGenerator';
import { MapRenderer } from '@/terrain_view/MapRenderer';

export class HexGridInteractSystem {
    private eventManager: EventManager = new EventManager(); // 事件管理器
    private raycaster: THREE.Raycaster = new THREE.Raycaster(); // 光线投射器
    private mouse: THREE.Vector2 = new THREE.Vector2(); // 鼠标位置
    private hoveredCell: HexCellView | null = null; // 当前悬停的单元格

    constructor(private scene: THREE.Scene, private camera: THREE.Camera, private renderer: THREE.WebGLRenderer, private mapRender: MapRenderer) {
        this.init();
    }

    private init(): void {
        // 监听事件
        this.eventManager.on('cellHover', (cell: HexCellView) => this.handleCellHover(cell));
        this.eventManager.on('cellHoverEnd', (cell: HexCellView) => this.handleCellHoverEnd(cell));
        this.eventManager.on('cellClick', (cell: HexCellView) => this.handleCellClick(cell));

        // 绑定鼠标移动事件
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));

        // 绑定鼠标点击事件
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));

        console.warn("HexGridInteractSystem init !!!!!!!!!!!!")

    }

    private get cellViews(): Map<string, HexCellView> {
        return this.mapRender.cellViews;
    }

    // 处理鼠标移动事件
    private onMouseMove(event: MouseEvent): void {
        // 将鼠标位置归一化为设备坐标（-1到+1）
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 更新光线投射器
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 检测与网格的交互
        const views = Array.from(this.cellViews.values());

        const intersects = this.raycaster.intersectObjects(views.map(cell => cell.mesh));
        console.log("intersects.length   " + intersects.length);//为什么这里输出 0 个？？？？
        if (intersects.length > 0) {
            const intersectedCell = views.find(cell => cell.mesh === intersects[0].object);
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

    // 处理鼠标点击事件
    private onMouseClick(event: MouseEvent): void {
        // 将鼠标位置归一化为设备坐标（-1到+1）
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 更新光线投射器
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 检测与网格的交互
        const views = Array.from(this.cellViews.values());
        const intersects = this.raycaster.intersectObjects(views.map(cell => cell.mesh));
        if (intersects.length > 0) {
            const intersectedCell = views.find(cell => cell.mesh === intersects[0].object);
            if (intersectedCell) {
                intersectedCell.onClick(); // 触发点击事件
            }
        }
    }

    // 处理悬停事件
    private handleCellHover(cell: HexCellView): void {
        console.warn(`Cell hovered: (${cell.q}, ${cell.r})`);
    }

    // 处理悬停结束事件
    private handleCellHoverEnd(cell: HexCellView): void {
        console.warn(`Cell hover ended: (${cell.q}, ${cell.r})`);
    }

    // 处理点击事件
    private handleCellClick(cell: HexCellView): void {
        console.warn(`Cell clicked: (${cell.q}, ${cell.r})`);
    }

    // 处理全局点击事件（取消选中）
    private handleGlobalClick(): void {
        this.cellViews.forEach(cell => cell.cancelAction());
    }
}