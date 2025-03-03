import * as THREE from 'three';
import { EventManager } from '../utils/EventManager';

export class HexCellView {
    public mesh: THREE.Mesh; // 六边形网格的3D对象
    public isHovered: boolean = false; // 是否悬停
    public isSelected: boolean = false; // 是否选中

    constructor(
        public q: number, // 六边形网格的q坐标
        public r: number, // 六边形网格的r坐标
        private eventManager: EventManager // 事件管理器
    ) {
        // 创建六边形网格
        const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 6);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(q * 1.5, 0, r * Math.sqrt(3) - (q % 2) * (Math.sqrt(3) / 2);
        this.mesh.rotation.x = Math.PI / 2;

        // 绑定事件
        this.bindEvents();
    }

    // 绑定事件
    private bindEvents(): void {
        this.mesh.addEventListener('pointerover', () => this.onHover());//Argument of type '"pointerover"' is not assignable to parameter of type 'keyof Object3DEventMap'.ts(2345)
        this.mesh.addEventListener('pointerout', () => this.onHoverEnd());
        this.mesh.addEventListener('click', () => this.onClick());
    }

    // 悬停事件
    public onHover(): void {
        this.isHovered = true;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(0xff0000); // 高亮红色
        this.eventManager.emit('cellHover', this);
    }

    // 悬停结束事件
    public onHoverEnd(): void {
        this.isHovered = false;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
        this.eventManager.emit('cellHoverEnd', this);
    }

    // 点击事件
    public onClick(): void {
        this.isSelected = !this.isSelected;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(this.isSelected ? 0x0000ff : 0x00ff00); // 选中蓝色
        this.eventManager.emit('cellClick', this);
    }

    // 取消操作
    public cancelAction(): void {
        this.isSelected = false;
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(0x00ff00); // 恢复绿色
    }
}