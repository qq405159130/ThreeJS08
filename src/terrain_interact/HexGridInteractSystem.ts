import * as THREE from 'three';
import { HexCellView } from './HexCellView';
import { EventManager } from '../utils/EventManager';
import { ServiceManager } from '@/utils/ServiceManager';
import { MyCameraControls } from '@/MyCameraControls';
// import { HexCellInteractEffectHandler } from './HexCellInteractEffectHandler';
import { Config } from '@/config';
import { HexCellRectSelectView } from './HexCellRectSelectView';
import { HexCellHoverEffectHandler } from './HexCellHoverEffectHandler';
import { HexCellSelectEffectHandler } from './HexCellSelectEffectHandler';
import { PosUtils } from '@/utils/PosUtils';


export class HexGridInteractSystem {
    private raycaster: THREE.Raycaster = new THREE.Raycaster(); // 光线投射器
    private mouse: THREE.Vector2 = new THREE.Vector2(); // 鼠标位置
    private hoveredCells: Set<HexCellView> = new Set(); // 当前悬停的单元格集合
    private selectedCells: Set<HexCellView> = new Set(); // 当前选中的单元格
    private isDragging: boolean = false; // 是否正在拖动
    private isDragDone: boolean = true;
    private dragStart: THREE.Vector2 = new THREE.Vector2(); // 拖动起始位置
    private dragEnd: THREE.Vector2 = new THREE.Vector2(); // 拖动结束位置
    private eventManager: EventManager;

    // private interactEffectHandler: HexCellInteractEffectHandler;
    private hoverEffectHandler: HexCellHoverEffectHandler;
    private selectEffectHandler: HexCellSelectEffectHandler;
    private rectSelectView: HexCellRectSelectView;

    /** 框选模式枚举 */
    private static SELECTION_MODE = {
        SCREEN: 'screen', // 屏幕范围框选
        GROUND: 'ground', // 地面矩形框选
    };
    private selectionMode: string = HexGridInteractSystem.SELECTION_MODE.GROUND; // 默认使用地面矩形框选

    constructor(
        private scene: THREE.Scene,
        private camera: THREE.Camera,
        private renderer: THREE.WebGLRenderer,
        eventManager: EventManager
    ) {
        this.eventManager = eventManager;
        // this.interactEffectHandler = new HexCellInteractEffectHandler(); // 初始化 hoverEffectManager
        this.hoverEffectHandler = new HexCellHoverEffectHandler();
        this.selectEffectHandler = new HexCellSelectEffectHandler();
        this.rectSelectView = new HexCellRectSelectView(scene);
        this.init();
    }

    public dispose(): void {
        // this.interactEffectHandler.dispose();
        this.hoverEffectHandler.dispose();
        this.selectEffectHandler.dispose();
        this.rectSelectView.dispose();
    }

    // 更新系统
    public update(deltaTime: number): void {
        // 可以在这里添加每帧更新的逻辑

        // this.interactEffectHandler.update(deltaTime);
        this.hoverEffectHandler.update(deltaTime);
        this.selectEffectHandler.update(deltaTime);
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

        // 如果正在拖动，禁用单个单元格的悬停判断
        if (this.isDragging) {
            // 更新拖动结束位置
            if (MyCameraControls.isPointerLocked) {
                // 在 Pointer Lock 模式下使用相对移动量
                this.dragEnd.x += event.movementX;
                this.dragEnd.y += event.movementY;
            } else {
                // 在非 Pointer Lock 模式下使用绝对坐标
                this.dragEnd.set(event.clientX, event.clientY);
            }

            // 更新框选矩形面
            this.rectSelectView.updateSelectionRect(this.dragStart, this.dragEnd, this.camera);

            // 获取所有单元格视图
            const views = Array.from(this.cellViews.values());

            // 找到框选范围内的单元格
            const newHoveredCells = this.findHexCellBySelection(views, this.dragStart, this.dragEnd);

            // 处理悬停状态
            this.handleMultipleCellHover(newHoveredCells);
        } else {
            // 正常处理单个单元格的悬停
            const views = Array.from(this.cellViews.values());
            const intersects = this.raycaster.intersectObjects(views.map(cell => cell.mesh));
            if (intersects.length > 0) {
                const intersectedCell = views.find(cell => cell.mesh === intersects[0].object);
                Config.isLogInterative && console.log(`hover   views:${views.length}  intersects:${intersects.length}   ${intersectedCell != null}`);
                if (intersectedCell && !this.hoveredCells.has(intersectedCell)) {
                    // 如果当前单元格不在悬停集合中，则处理悬停
                    this.handleCellHoverStart(intersectedCell);
                    this.hoveredCells.add(intersectedCell);
                }
            } else if (this.hoveredCells.size > 0) {
                // 处理光标在地图外时，取消所有悬停
                this.hoveredCells.forEach(cell => this.handleCellHoverEnd(cell));
                this.hoveredCells.clear();
            }
        }
    }

    // 处理多个单元格的悬停状态
    private handleMultipleCellHover(newHoveredCells: Set<HexCellView>): void {
        // 找出需要取消悬停的单元格
        const cellsToUnhover = new Set<HexCellView>(this.hoveredCells);
        for (const cell of newHoveredCells) {
            cellsToUnhover.delete(cell);
        }

        // 取消不再悬停的单元格
        cellsToUnhover.forEach(cell => {
            this.handleCellHoverEnd(cell);
            this.hoveredCells.delete(cell);
        });

        // 处理新悬停的单元格
        newHoveredCells.forEach(cell => {
            if (!this.hoveredCells.has(cell)) {
                this.handleCellHoverStart(cell);
                this.hoveredCells.add(cell);
            }
        });
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

    /**
     * 设置框选模式
     * @param mode 框选模式（SCREEN 或 GROUND）
     */
    public setSelectionMode(mode: string): void {
        if (mode === HexGridInteractSystem.SELECTION_MODE.SCREEN || mode === HexGridInteractSystem.SELECTION_MODE.GROUND) {
            this.selectionMode = mode;
        } else {
            console.warn('Invalid selection mode. Supported modes are "screen" and "ground".');
        }
    }

    /**
     * 根据框选模式找到框选范围内的单元格
     * @param cellViews 所有单元格视图
     * @param start 框选起点
     * @param end 框选终点
     * @returns 框选范围内的单元格集合
     */
    private findHexCellBySelection(cellViews: HexCellView[], start: THREE.Vector2, end: THREE.Vector2): Set<HexCellView> {
        if (this.selectionMode === HexGridInteractSystem.SELECTION_MODE.SCREEN) {
            return this.findHexCellByScreenRect(cellViews, start, end);
        } else {
            return this.findHexCellByGroundRect(cellViews, start, end);
        }
    }

    /**
     * 基于屏幕范围的框选
     * @param cellViews 所有单元格视图
     * @param sp 框选起点（屏幕坐标）
     * @param ep 框选终点（屏幕坐标）
     * @returns 框选范围内的单元格集合
     */
    private findHexCellByScreenRect(cellViews: HexCellView[], sp: THREE.Vector2, ep: THREE.Vector2): Set<HexCellView> {
        const findCells = new Set<HexCellView>();
        const minX = Math.min(sp.x, ep.x);
        const maxX = Math.max(sp.x, ep.x);
        const minY = Math.min(sp.y, ep.y);
        const maxY = Math.max(sp.y, ep.y);

        cellViews.forEach(cell => {
            const screenPosition = PosUtils.getScreenPos(cell.mesh.position, this.camera);
            if (
                screenPosition.x >= minX &&
                screenPosition.x <= maxX &&
                screenPosition.y >= minY &&
                screenPosition.y <= maxY
            ) {
                findCells.add(cell);
            }
        });

        return findCells;
    }

    /**
     * 基于地面矩形的框选
     * @param cellViews 所有单元格视图
     * @param sp 框选起点（屏幕坐标）
     * @param ep 框选终点（屏幕坐标）
     * @returns 框选范围内的单元格集合
     */
    private findHexCellByGroundRect(cellViews: HexCellView[], sp: THREE.Vector2, ep: THREE.Vector2): Set<HexCellView> {
        const findCells = new Set<HexCellView>();

        // 将屏幕坐标转换为世界坐标（基于地面平面）
        const startWorld = PosUtils.getWorldPos(sp, this.camera);
        const endWorld = PosUtils.getWorldPos(ep, this.camera);

        const minX = Math.min(startWorld.x, endWorld.x);
        const maxX = Math.max(startWorld.x, endWorld.x);
        const minZ = Math.min(startWorld.z, endWorld.z);
        const maxZ = Math.max(startWorld.z, endWorld.z);

        cellViews.forEach(cell => {
            const cellPos = cell.mesh.position;
            if (
                cellPos.x >= minX &&
                cellPos.x <= maxX &&
                cellPos.z >= minZ &&
                cellPos.z <= maxZ
            ) {
                findCells.add(cell);
            }
        });

        return findCells;
    }


    // 处理框选逻辑
    private handleBoxSelect(event: MouseEvent): void {
        const views = Array.from(this.cellViews.values());
        const preSelectedCells = new Set<HexCellView>()
        const newSelectedCells = this.findHexCellByScreenRect(views, this.dragStart, this.dragEnd);

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
        this.hoverEffectHandler.showHoverEffect([cell.mesh]);
    }

    // 处理悬停结束事件
    private handleCellHoverEnd(cell: HexCellView): void {
        // cell.onHoverEnd(); 
        Config.isLogInterative && console.warn(`Cell hover ended: (${cell.q}, ${cell.r})`);
        this.hoverEffectHandler.hideHoverEffect([cell.mesh]);
    }

    // 处理选中事件
    private handleCellSelect(cells: HexCellView[]): void {
        // cell.onSelect();
        Config.isLogInterative && console.warn("handle CellSelect ~~~~~");
        this.selectEffectHandler.showSelectEffect(cells.map(cell => cell.mesh));
    }

    // 处理取消操作事件
    private handleCellDeselect(cells: HexCellView[]): void {
        // cell.cancelAction();
        Config.isLogInterative && console.warn("handle CellDeselect ~~~~~");
        this.selectEffectHandler.hideSelectEffect(cells.map(cell => cell.mesh));
    }

    // // 处理框选悬停事件
    // private handleCellSelectHover(cells: HexCellView[]): void {
    //     // cell.onSelectHoverStart();
    //     Config.isLogInterative && console.warn("handle CellSelectHover ~~~~~");
    //     this.interactEffectHandler.showHoverEffect(cells.map(cell => cell.mesh));
    // }

    // // 处理框选悬停结束事件
    // private handleCellSelectHoverEnd(cells: HexCellView[]): void {
    //     // cell.onHoverEnd(); 
    //     Config.isLogInterative && console.warn("handle CellSelectHoverEnd ~~~~~");
    //     this.interactEffectHandler.hideHoverEffect(cells.map(cell => cell.mesh));
    // }

}