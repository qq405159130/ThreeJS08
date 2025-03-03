// src/terrain/HexCell.ts
import * as THREE from 'three';
import { EventManager } from '../utils/EventManager';
import { HexCellData } from '../terrain/types';

export class HexCellView {
    public mesh: THREE.Mesh; // 六边形网格的3D对象
    public isHovered: boolean = false; // 是否悬停
    public isSelected: boolean = false; // 是否选中

    private eventManager?: EventManager;

    constructor(public q: number, public r: number, cellData: HexCellData) {
        this.mesh = this.createHexMesh(cellData);
    }

    /**
     * 创建六边形网格
     * @param cellData 六边形单元格数据
     * @returns 六边形网格
     */
    private createHexMesh(cellData: HexCellData): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 6);
        // const material = this.terrainMaterialSystem.getMaterial(cell.terrainType);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        // mesh.renderOrder = 1; // 设置一个较高的渲染顺序

        const x = 1.5 * cellData.q;
        const z = Math.sqrt(3) * (cellData.r + cellData.q / 2);
        mesh.position.set(x, 0, z);
        // console.warn('Created Hex Mesh:', mesh); // 打印网格信息
        return mesh;
    }

    public init(eventManager: EventManager) {
        this.eventManager = eventManager;
    }

    // 悬停事件
    public onHover(): void {
        console.warn("onHover ~~~~~");
        this.isHovered = true;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(0xff0000); // 高亮红色
        this.eventManager?.emit('cellHover', this);
    }

    // 悬停结束事件
    public onHoverEnd(): void {
        console.warn("onHoverEnd ~~~~~");
        this.isHovered = false;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
        this.eventManager?.emit('cellHoverEnd', this);
    }

    // 点击事件
    public onClick(): void {
        console.warn("onClick ~~~~~");
        this.isSelected = !this.isSelected;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(this.isSelected ? 0x0000ff : 0x00ff00); // 选中蓝色
        this.eventManager?.emit('cellClick', this);
    }

    // 取消操作
    public cancelAction(): void {
        this.isSelected = false;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
    }
}