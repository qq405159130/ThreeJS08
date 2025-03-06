import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { ServiceManager } from '@/utils/ServiceManager';
import { MyCameraControls } from '@/MyCameraControls';
import { HexCellInteractEffectHandler } from './HexCellInteractEffectHandler';
import { Config } from '@/config';
import { HexCellRectSelectView } from './HexCellRectSelectView';

export class HexGridInteractSystem {
    private raycaster: THREE.Raycaster = new THREE.Raycaster(); // 光线投射器
    private mouse: THREE.Vector2 = new THREE.Vector2(); // 鼠标位置
    private hoveredCell: HexCellView | null = null; // 当前悬停的单元格
    private selectedCells: Set<HexCellView> = new Set(); // 当前选中的单元格
    private isDragging: boolean = false; // 是否正在拖动
    private isDragDone: boolean = true;
    private dragStart: THREE.Vector2 = new THREE.Vector2(); // 拖动起始位置
    private dragEnd: THREE.Vector2 = new THREE.Vector2(); // 拖动结束位置
    private eventManager: EventManager;

    private hoverEffectManager: HexCellInteractEffectHandler;
    private rectSelectView: HexCellRectSelectView;

    constructor(
        private scene: THREE.Scene,
        private camera: THREE.Camera,
        private renderer: THREE.WebGLRenderer,
        eventManager: EventManager
    ) {
        this.eventManager = eventManager;
        this.hoverEffectManager = new HexCellInteractEffectHandler(); // 初始化 hoverEffectManager
        this.rectSelectView = new HexCellRectSelectView(scene);
        this.init();
    }

    public dispose(): void {
        this.hoverEffectManager.dispose();

        this.rectSelectView.dispose();
    }

    // 初始化
    private init(): void {
        // 绑定鼠标移动事件
        window.addEventListener('mousemove', (event) => this.bindMouseEvent(event, this.onMouseMove));

        // 绑定鼠标点击事件
        window.addEventListener('click', (event) => this.bindMouseEvent(event, this.onMouseClick));

        // 绑定鼠标按下事件
        window.addEventListener('mousedown', (event) => this.bindMouseEvent(event, this.onMouseDown));

        // 绑定鼠标松开事件
        window.addEventListener('mouseup', (event) => this.bindMouseEvent(event, this.onMouseUp));

        console.warn("HexGridInteractSystem initialized!");
    }

    //绑定鼠标方法，并检查在画布范围内才生效
    private bindMouseEvent(event: MouseEvent, fn: (event: MouseEvent) => void) {
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        // 检查点击事件是否发生在画布区域内
        if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
            fn.call(this, event);
        }
    }

    // 获取所有单元格视图
    private get cellViews(): Map<string, HexCellView> {
        return ServiceManager.getInstance().getHexCellViewMgr().getCellViews();
    }

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
        // Config.isLogInterative && console.warn(`hover     views:${views.length}       intersects:${intersects.length}    this.scene.children.length: ${this.scene.children.length}`);
        if (intersects.length > 0) {
            const intersectedCell = views.find(cell => cell.mesh === intersects[0].object);
            if (intersectedCell && intersectedCell !== this.hoveredCell) {
                if (this.hoveredCell) {
                    this.handleCellHoverEnd(this.hoveredCell);// 结束上一个悬停
                }
                this.handleCellHoverStart(intersectedCell);// 开始新的悬停
                this.hoveredCell = intersectedCell;
            }
        } else if (this.hoveredCell) {//处理光标在地图外时，取消hover
            this.handleCellHoverEnd(this.hoveredCell);
            this.hoveredCell = null;
        }
        // 更新框选矩形面
        if (this.isDragging) {
            // console.warn(`onMouseMove  (${event.clientX}, ${event.clientY})  (${event.offsetX}, ${event.offsetY}) `);//奇怪，这些坐标都是不变的。
            // console.warn(`onMouseMove   (${event.movementX}, ${event.movementY})    `);//这些坐标有变化，但数值变化很小，大约只是-10~10之间，不知道意味着什么。
            if (MyCameraControls.isPointerLocked) {
                // 在 Pointer Lock 模式下使用相对移动量
                this.dragEnd.x += event.movementX;
                this.dragEnd.y += event.movementY;
            } else {
                // 在非 Pointer Lock 模式下使用绝对坐标
                this.dragEnd.set(event.clientX, event.clientY);
            }
            this.rectSelectView.updateSelectionRect(this.dragStart, this.dragEnd, this.camera);
        }
    }

    // 处理鼠标点击事件
    private onMouseClick(event: MouseEvent): void {
        if (!this.isDragDone) {
            // console.warn("还在拖动中  :")
            return;//还在拖动中
        }
        // 将鼠标位置归一化为设备坐标（-1到+1）
        this.mouse.x = MyCameraControls.isPointerLocked ? 0 : (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = MyCameraControls.isPointerLocked ? 0 : -(event.clientY / window.innerHeight) * 2 + 1;
        console.error("click")
        // 更新光线投射器
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // 检测与网格的交互
        const views = Array.from(this.cellViews.values());
        const intersects = this.raycaster.intersectObjects(views.map(cell => cell.mesh));
        console.warn("click  :" + intersects.length)
        if (intersects.length > 0) {
            const intersectedCell = views.find(cell => cell.mesh === intersects[0].object);
            if (intersectedCell) {
                if (event.shiftKey) {
                    // 加选逻辑
                    if (this.selectedCells.has(intersectedCell)) {
                        this.handleCellDeselect([intersectedCell]);
                        this.selectedCells.delete(intersectedCell);
                    } else {
                        this.handleCellSelect([intersectedCell]);
                        this.selectedCells.add(intersectedCell);
                    }
                } else {
                    // 点选逻辑
                    // this.selectedCells.forEach(cell => cell.cancelAction());
                    this.handleCellDeselect(Array.from(this.selectedCells))
                    this.selectedCells.clear();
                    this.handleCellSelect([intersectedCell]);
                    this.selectedCells.add(intersectedCell);
                }
            }
        }
    }

    // 处理鼠标按下事件
    private onMouseDown(event: MouseEvent): void {
        if (event.button === 0) { // 左键按下
            this.isDragging = true;
            this.dragStart.set(event.clientX, event.clientY);
            this.dragEnd.set(event.clientX, event.clientY);
            this.rectSelectView.createSelectionRect();
        }
    }

    // 处理鼠标松开事件
    private onMouseUp(event: MouseEvent): void {
        if (event.button === 0) { // 左键松开
            this.isDragging = false;
            this.dragEnd.set(event.clientX, event.clientY);
            this.rectSelectView.removeSelectionRect();
            //drag起终点不会太近时
            if (!(Math.abs(this.dragStart.x - this.dragEnd.x) < 10 && Math.abs(this.dragStart.y - this.dragEnd.y) < 10)) {
                this.handleBoxSelect(event);
                this.isDragDone = false;
                setTimeout(() => { this.isDragDone = true }, 0);
            }
        }
    }

    // 处理框选逻辑
    private handleBoxSelect(event: MouseEvent): void {
        const views = Array.from(this.cellViews.values());
        const newSelectedCells = new Set<HexCellView>();
        const preSelectedCells = new Set<HexCellView>()

        const minX = Math.min(this.dragStart.x, this.dragEnd.x);
        const maxX = Math.max(this.dragStart.x, this.dragEnd.x);
        const minY = Math.min(this.dragStart.y, this.dragEnd.y);
        const maxY = Math.max(this.dragStart.y, this.dragEnd.y);

        views.forEach(cell => {
            const screenPosition = new THREE.Vector3();
            cell.mesh.getWorldPosition(screenPosition);
            screenPosition.project(this.camera);

            const x = (screenPosition.x + 1) * window.innerWidth / 2;
            const y = (-screenPosition.y + 1) * window.innerHeight / 2;

            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                newSelectedCells.add(cell);
            }
        });


        if (event.shiftKey) {
            // 加选逻辑
            this.selectedCells.forEach(cell => {
                newSelectedCells.add(cell);
            });
            this.selectedCells = newSelectedCells;
        } else {
            // 点选逻辑
            this.selectedCells.forEach(cell => {
                preSelectedCells.add(cell)
            });
            this.selectedCells = newSelectedCells;
        }

        preSelectedCells.size != 0 && this.handleCellDeselect(Array.from(preSelectedCells));
        newSelectedCells.size != 0 && this.handleCellSelect(Array.from(newSelectedCells));
    }

    // 处理悬停事件
    private handleCellHoverStart(cell: HexCellView): void {
        // cell.onHoverStart(); 
        Config.isLogInterative && console.warn(`Cell hovered: (${cell.q}, ${cell.r})`);
        this.hoverEffectManager.showHoverEffect([cell.mesh]);
    }

    // 处理悬停结束事件
    private handleCellHoverEnd(cell: HexCellView): void {
        // cell.onHoverEnd(); 
        Config.isLogInterative && console.warn(`Cell hover ended: (${cell.q}, ${cell.r})`);
        this.hoverEffectManager.hideHoverEffect([cell.mesh]);
    }

    // 处理选中事件
    private handleCellSelect(cells: HexCellView[]): void {
        // cell.onSelect();
        Config.isLogInterative && console.warn("handle CellSelect ~~~~~");
        this.hoverEffectManager.showSelectEffect(cells.map(cell => cell.mesh));
    }

    // 处理取消操作事件
    private handleCellDeselect(cells: HexCellView[]): void {
        // cell.cancelAction();
        Config.isLogInterative && console.warn("handle CellDeselect ~~~~~");
        this.hoverEffectManager.hideSelectEffect(cells.map(cell => cell.mesh));
    }

    // 处理框选悬停事件
    private handleCellSelectHover(cells: HexCellView[]): void {
        // cell.onSelectHoverStart();
        Config.isLogInterative && console.warn("handle CellSelectHover ~~~~~");
        this.hoverEffectManager.showHoverEffect(cells.map(cell => cell.mesh));
    }

    // 处理框选悬停结束事件
    private handleCellSelectHoverEnd(cells: HexCellView[]): void {
        // cell.onHoverEnd(); 
        Config.isLogInterative && console.warn("handle CellSelectHoverEnd ~~~~~");
        this.hoverEffectManager.hideHoverEffect(cells.map(cell => cell.mesh));
    }

    // 更新系统
    public update(): void {
        // 可以在这里添加每帧更新的逻辑
    }
}