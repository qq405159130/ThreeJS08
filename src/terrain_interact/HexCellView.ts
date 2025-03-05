import * as THREE from 'three';
import { EventManager } from '../utils/EventManager';
import { HexCellData } from '../terrain/types';
import { Config } from '../config';

export class HexCellView {
    public mesh: THREE.Mesh; // 六边形网格的3D对象
    public isHovered: boolean = false; // 是否悬停
    public isSelected: boolean = false; // 是否选中

    private eventManager?: EventManager;

    // private canShowInterative: boolean = false;

    constructor(public q: number, public r: number, mesh: THREE.Mesh) {
        this.mesh = mesh;
    }

    public init(eventManager: EventManager) {
        this.eventManager = eventManager;
    }

    // // 悬停事件
    // public onHoverStart(): void {
    //     Config.isLogInterative && console.warn("onHover ~~~~~");
    //     this.isHovered = true;
    //     // this.canShowInterative && (this.mesh.material as THREE.MeshBasicMaterial).color.set(0xff0000); // 高亮红色
    //     this.eventManager?.emit('cellHover', this);
    // }

    // // 悬停结束事件
    // public onHoverEnd(): void {
    //     Config.isLogInterative && console.warn("onHoverEnd ~~~~~");
    //     this.isHovered = false;
    //     // this.canShowInterative && (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
    //     this.eventManager?.emit('cellHoverEnd', this);
    // }

    // // 取消操作
    // public cancelAction(): void {
    //     this.isSelected = false;
    //     // this.canShowInterative && (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
    //     this.eventManager?.emit('cellCancelAction', this);
    // }

    // // 刚被算入框选范围。
    // public onSelectHoverStart(): void {
    //     this.eventManager?.emit('cellSelectHover', this);
    // }

    // // 刚被移出框选范围。
    // public onSelectHoverEnd(): void {
    //     this.eventManager?.emit('cellSelectHoverEnd', this);
    // }

    // // 被选中
    // public onSelect(): void {
    //     this.isSelected = true;
    //     this.eventManager?.emit('cellSelect', this);
    // }
}