// src/terrain/HexCell.ts
import * as THREE from 'three';
import { EventManager } from '../utils/EventManager';
import { HexCellData } from '../terrain/types';

export class HexCellView {
    public mesh: THREE.Mesh; // 六边形网格的3D对象
    public isHovered: boolean = false; // 是否悬停
    public isSelected: boolean = false; // 是否选中

    private eventManager?: EventManager;

    private canShowInterative: boolean = false;

    constructor(public q: number, public r: number, mesh: THREE.Mesh) {
        this.mesh = mesh;
    }



    public init(eventManager: EventManager) {
        this.eventManager = eventManager;
    }

    // 悬停事件
    public onHover(): void {
        console.warn("onHover ~~~~~");
        this.isHovered = true;
        this.canShowInterative && (this.mesh.material as THREE.MeshBasicMaterial).color.set(0xff0000); // 高亮红色
        this.eventManager?.emit('cellHover', this);
    }

    // 悬停结束事件
    public onHoverEnd(): void {
        console.warn("onHoverEnd ~~~~~");
        this.isHovered = false;
        this.canShowInterative && (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
        this.eventManager?.emit('cellHoverEnd', this);
    }

    // 点击事件
    public onClick(): void {
        console.warn("onClick ~~~~~");
        this.isSelected = !this.isSelected;
        this.canShowInterative && (this.mesh.material as THREE.MeshBasicMaterial).color.set(this.isSelected ? 0x0000ff : 0x00ff00); // 选中蓝色
        this.eventManager?.emit('cellClick', this);
    }

    // 取消操作
    public cancelAction(): void {
        this.isSelected = false;
        this.canShowInterative && (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
    }
}