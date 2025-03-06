import * as THREE from 'three';

export class HexCellHoverEffect {
    private mesh?: THREE.Mesh; // 六边形网格
    private border?: THREE.LineSegments; // 边框
    private overlay?: THREE.Mesh; // 颜色叠加
    private originalScale?: THREE.Vector3; // 原始缩放值
    private selectOverlay?: THREE.Mesh; // 选中叠加

    constructor() {

    }

    public init(mesh: THREE.Mesh) {
        this.mesh = mesh;
        this.originalScale = mesh.scale.clone(); // 保存原始缩放值
        this._createBorder();
        this._createOverlay();
        this._createSelectOverlay();
    }

    private _createBorder(): void {
        if (!this.mesh)
            return;
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
        else
        {
            this.border.position.x = this.mesh.position.x;
            this.border.position.y = this.mesh.position.y;
            this.border.position.z = this.mesh.position.z;
        }
    }

    private _createOverlay(): void {
        if (!this.mesh)
            return;
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
        else
        {
            this.overlay.position.x = this.mesh.position.x;
            this.overlay.position.y = this.mesh.position.y;
            this.overlay.position.z = this.mesh.position.z;
        }
    }

    private _createSelectOverlay(): void {
        if (!this.mesh)
            return;
        if (!this.selectOverlay) {
            const selectOverlayGeometry = this.mesh.geometry.clone();
            const selectOverlayMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
            this.selectOverlay = new THREE.Mesh(selectOverlayGeometry, selectOverlayMaterial);
            //避免干扰
            this.selectOverlay.castShadow = false;
            this.selectOverlay.receiveShadow = false;
            this.selectOverlay.raycast = () => null;
            //尽量让 selectOverlay 节省性能
            this.selectOverlay.name = 'selectOverlay';
            this.selectOverlay.matrixAutoUpdate = false;
            this.selectOverlay.updateMatrix();
            this.mesh.add(this.selectOverlay);
        }
        else
        {
            this.selectOverlay.position.x = this.mesh.position.x;
            this.selectOverlay.position.y = this.mesh.position.y;
            this.selectOverlay.position.z = this.mesh.position.z;
        }
    }

    /**
     * 显示 hover 效果
     */
    public showHover(): void {
        if (!this.mesh)
            return;
        // 显示边框
        if (this.border)
            this.border.visible = true;

        // 显示颜色叠加
        if (this.overlay)
            this.overlay.visible = true;

        // 放大六边形
        this.mesh.scale.set(1.1, 1.1, 1.1); // 放大 10%
        // console.warn("显示 hover");
    }

    /**
     * 显示选中效果
     */
    public showSelect(): void {
        if (!this.mesh)
            return;
        // 显示选中叠加
        if (this.selectOverlay)
            this.selectOverlay.visible = true;
        // console.warn("显示选中");
    }

    /**
     * 隐藏 hover 效果
     */
    public hideHover(): void {
        if (this.border) {
            this.border.visible = false;
        }
        if (this.overlay) {
            this.overlay.visible = false;
        }
        // 恢复原始缩放
        this.mesh?.scale.copy(this.originalScale ? this.originalScale : new THREE.Vector3(1, 1, 1));
    }

    /**
     * 隐藏选中效果
     */
    public hideSelect(): void {
        if (this.selectOverlay) {
            this.selectOverlay.visible = false;
        }
        // console.warn("显示 不选");
    }

    /**
     * 销毁 hover 效果
     */
    public dispose(): void {
        if (!this.mesh)
            return;
        if (this.border) {
            this.mesh.remove(this.border);
            this.border = undefined;
        }

        // 隐藏颜色叠加
        if (this.overlay) {
            this.mesh.remove(this.overlay);
            this.overlay = undefined;
        }

        if (this.selectOverlay) {
            this.mesh.remove(this.selectOverlay);
            this.selectOverlay = undefined;
        }
        this.mesh = null!;
    }
}