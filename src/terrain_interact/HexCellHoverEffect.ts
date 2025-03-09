import * as THREE from 'three';

export class HexCellHoverEffect {
    private mesh?: THREE.Mesh; // 六边形网格
    private border?: THREE.LineSegments; // 边框
    private overlay?: THREE.Mesh; // 颜色叠加
    private originalScale?: THREE.Vector3; // 原始缩放值
    private hoverColor: THREE.Color = new THREE.Color(0xffa500); // 悬停颜色（橙色）

    private _useID: string = "";
    public get useID(): string { return this._useID; }

    constructor() {
        console.warn('HexCellHoverEffect constructor');
    }

    /**
     * 销毁 hover 效果
     */
    public dispose(): void {
        if (!this.mesh) return;

        if (this.border) {
            this.mesh.remove(this.border);
            this.border = undefined;
        }
        if (this.overlay) {
            this.mesh.remove(this.overlay);
            this.overlay = undefined;
        }

        this.mesh = null!;
    }

    public init(mesh: THREE.Mesh): void {
        this.mesh = mesh;
        this._useID = mesh.userData.id;
        this.originalScale = mesh.scale.clone(); // 保存原始缩放值
        this._createBorder();
        this._createOverlay();
    }

    public reset(): void {
        this.hideHover();
    }

    public update(deltaTime: number): void {
        // 悬停效果不需要每帧更新
    }

    public showHover(): void {
        if (!this.mesh) return;

        if (this.overlay) this.overlay.visible = true;
        if (this.border) this.border.visible = true;
        this.mesh.scale.set(0.8, 0.8, 0.8); // 悬停时缩放
    }

    public hideHover(): void {
        if (!this.mesh) return;

        if (this.overlay) this.overlay.visible = false;
        if (this.border) this.border.visible = false;
        this.mesh.scale.copy(this.originalScale || new THREE.Vector3(1, 1, 1)); // 恢复原始大小
    }

    private _createBorder(): void {
        if (!this.mesh) return;

        if (!this.border) {
            const edges = new THREE.EdgesGeometry(this.mesh.geometry);
            const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 }); // 黄色边框
            this.border = new THREE.LineSegments(edges, borderMaterial);
            this.border.castShadow = false;
            this.border.receiveShadow = false;
            this.border.raycast = () => null;
            this.border.name = 'border';
            this.border.matrixAutoUpdate = false;
            this.border.updateMatrix();
            this.border.visible = false;
            this.mesh.add(this.border);
        } else {
            this.mesh.add(this.border);
            this.border.position.copy(this.mesh.position);
        }
    }

    private _createOverlay(): void {
        if (!this.mesh) return;

        if (!this.overlay) {
            const overlayGeometry = this.mesh.geometry.clone();
            const overlayMaterial = new THREE.MeshBasicMaterial({ color: this.hoverColor, transparent: true, opacity: 0.5 }); // 半透明叠加
            this.overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
            this.overlay.castShadow = false;
            this.overlay.receiveShadow = false;
            this.overlay.raycast = () => null;
            this.overlay.name = 'overlay';
            this.overlay.matrixAutoUpdate = false;
            this.overlay.updateMatrix();
            this.overlay.visible = false;
            this.mesh.add(this.overlay);
        } else {
            this.mesh.add(this.overlay);
            this.overlay.position.copy(this.mesh.position);
        }
    }
}