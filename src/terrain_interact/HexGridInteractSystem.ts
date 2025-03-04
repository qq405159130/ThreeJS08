import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { ServiceManager } from '@/utils/ServiceManager';
import { MyCameraControls } from '@/MyCameraControls';
import { HexCellHoverEffectManager } from './HexCellHoverEffectManager';
import { Config } from '@/config';

export class HexGridInteractSystem {
    private raycaster: THREE.Raycaster = new THREE.Raycaster(); // 光线投射器
    private mouse: THREE.Vector2 = new THREE.Vector2(); // 鼠标位置
    private hoveredCell: HexCellView | null = null; // 当前悬停的单元格
    private eventManager: EventManager;

    private hoverEffectManager: HexCellHoverEffectManager = new HexCellHoverEffectManager();

    constructor(
        private scene: THREE.Scene,
        private camera: THREE.Camera,
        private renderer: THREE.WebGLRenderer,
        eventManager: EventManager
    ) {
        this.eventManager = eventManager;
        this.init();
    }

    public dispose(): void {
        this.hoverEffectManager.dispose();
    }

    // 初始化
    private init(): void {
        // 监听事件
        this.eventManager.on('cellHover', (cell: HexCellView) => this.handleCellHover(cell));
        this.eventManager.on('cellHoverEnd', (cell: HexCellView) => this.handleCellHoverEnd(cell));
        this.eventManager.on('cellClick', (cell: HexCellView) => this.handleCellClick(cell));

        // 绑定鼠标移动事件
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));

        // 绑定鼠标点击事件
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));

        console.warn("HexGridInteractSystem initialized!");
    }

    // 获取所有单元格视图
    private get cellViews(): Map<string, HexCellView> {
        return ServiceManager.getInstance().getHexCellViewMgr().getCellViews();
    }

    // private onMouseMove(event: MouseEvent): void {
    //     // 将鼠标位置归一化为设备坐标（-1到+1）
    //     this.mouse.x = MyCameraControls.isPointerLocked ? 0 : (event.clientX / window.innerWidth) * 2 - 1;
    //     this.mouse.y = MyCameraControls.isPointerLocked ? 0 : -(event.clientY / window.innerHeight) * 2 + 1;
    //     this.raycaster.setFromCamera(this.mouse, this.camera);

    //     if (Config.useInstancedMesh) {
    //         // 处理 InstancedMesh 的交互
    //         const intersects = this.raycaster.intersectObjects(this.scene.children);
    //         if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
    //             console.warn('Hovered instance:', intersects[0].instanceId);
    //         }
    //         else{
    //             console.warn('Hovered none:  this.scene.children ' + this.scene.children.length);
    //         }
    //     } else {
    //         // 处理普通 Mesh 的交互
    //         const meshs = ServiceManager.getInstance().getHexCellViewMgr().getAllMeshs();
    //         const intersects = this.raycaster.intersectObjects(meshs);
    //         if (intersects.length > 0) {
    //             const cell = intersects[0].object.userData;
    //             console.warn('Hovered cell:', cell.q, cell.r);
    //         }
    //         else{
    //             console.warn('Hovered none:    meshs ' + meshs.length);
    //         }
    //     }
    // }

    // 处理鼠标移动事件
    private onMouseMove(event: MouseEvent): void {
        // 将鼠标位置归一化为设备坐标（-1到+1）
        this.mouse.x = MyCameraControls.isPointerLocked ? 0 : (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = MyCameraControls.isPointerLocked ? 0 : -(event.clientY / window.innerHeight) * 2 + 1;
        // 更新光线投射器
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 检测与网格的交互
        const views = Array.from(this.cellViews.values());
        const intersects = this.raycaster.intersectObjects(views.map(cell => cell.mesh));
        console.warn(`hover     views:${views.length}       intersects:${intersects.length}    this.scene.children.length: ${this.scene.children.length}`);
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
        this.hoverEffectManager.showHoverEffect(cell.mesh);
    }

    // 处理悬停结束事件
    private handleCellHoverEnd(cell: HexCellView): void {
        console.warn(`Cell hover ended: (${cell.q}, ${cell.r})`);
        this.hoverEffectManager.hideHoverEffect();
    }

    // 处理点击事件
    private handleCellClick(cell: HexCellView): void {
        console.warn(`Cell clicked: (${cell.q}, ${cell.r})`);
    }

    // 处理全局点击事件（取消选中）
    private handleGlobalClick(): void {
        this.cellViews.forEach(cell => cell.cancelAction());
    }

    // 更新系统
    public update(): void {
        // 可以在这里添加每帧更新的逻辑
    }
}