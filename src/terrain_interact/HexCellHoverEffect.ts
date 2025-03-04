import * as THREE from 'three';

export class HexCellHoverEffect {
    private mesh: THREE.Mesh; // 六边形网格
    private border?: THREE.LineSegments; // 边框
    private overlay?: THREE.Mesh; // 颜色叠加
    private originalScale: THREE.Vector3; // 原始缩放值

    constructor(mesh: THREE.Mesh) {
        this.mesh = mesh;
        this.originalScale = mesh.scale.clone(); // 保存原始缩放值
    }

    /**
     * 显示 hover 效果
     */
    public show(): void {
        // 显示边框
        if (!this.border) {
            const edges = new THREE.EdgesGeometry(this.mesh.geometry);
            const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 }); // 黄色边框
            this.border = new THREE.LineSegments(edges, borderMaterial);
            //避免干扰
            this.border.castShadow = false;
            this.border.receiveShadow = false;
            this.border.raycast = () => null;
            //尽量让 border 节省性能
            this.border.name = 'border';
            this.border.matrixAutoUpdate = false;
            this.border.updateMatrix();
            this.mesh.add(this.border);
        }

        // 显示颜色叠加
        if (!this.overlay) {
            const overlayGeometry = this.mesh.geometry.clone();
            const overlayMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }); // 白色半透明
            this.overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
            //避免干扰
            this.overlay.castShadow = false;
            this.overlay.receiveShadow = false;
            this.overlay.raycast = () => null;
            //尽量让 overlay 节省性能
            this.overlay.name = 'overlay';
            this.overlay.matrixAutoUpdate = false;
            this.overlay.updateMatrix();
            this.mesh.add(this.overlay);
        }

        // 放大六边形
        this.mesh.scale.set(1.1, 1.1, 1.1); // 放大 10%
    }

    /**
     * 隐藏 hover 效果
     */
    public hide(): void {
        // 隐藏边框
        if (this.border) {
            this.mesh.remove(this.border);
            this.border = undefined;
        }

        // 隐藏颜色叠加
        if (this.overlay) {
            this.mesh.remove(this.overlay);
            this.overlay = undefined;
        }

        // 恢复原始缩放
        this.mesh.scale.copy(this.originalScale);
    }

    /**
     * 销毁 hover 效果
     */
    public dispose(): void {
        this.hide();
        this.mesh = null!;
    }
}