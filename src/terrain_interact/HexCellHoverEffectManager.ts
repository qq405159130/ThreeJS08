import * as THREE from 'three';
import { HexCellHoverEffect } from './HexCellHoverEffect';

export class HexCellHoverEffectManager {
    private hoverEffects: Map<THREE.Mesh, HexCellHoverEffect> = new Map(); // 六边形网格与 hover 效果的映射
    private currentHoverEffect: HexCellHoverEffect | null = null; // 当前 hover 的效果
    private currentSelectEffect: HexCellHoverEffect | null = null; // 当前选中的效果

    // 框选矩形面
    private selectionRect: THREE.Mesh | null = null;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /**
     * 获取或创建 hover 效果
     * @param mesh 六边形网格
     * @returns hover 效果
     */
    public getHoverEffect(mesh: THREE.Mesh): HexCellHoverEffect {
        let hoverEffect = this.hoverEffects.get(mesh);
        if (!hoverEffect) {
            hoverEffect = new HexCellHoverEffect(mesh);
            this.hoverEffects.set(mesh, hoverEffect);
        }
        return hoverEffect;
    }

    /**
     * 显示 hover 效果
     * @param mesh 六边形网格
     */
    public showHoverEffect(mesh: THREE.Mesh): void {
        if (this.currentHoverEffect) {
            this.currentHoverEffect.hide(); // 隐藏上一个 hover 效果
        }
        const hoverEffect = this.getHoverEffect(mesh);
        hoverEffect.show();
        this.currentHoverEffect = hoverEffect;
    }

    /**
     * 隐藏 hover 效果
     */
    public hideHoverEffect(): void {
        if (this.currentHoverEffect) {
            this.currentHoverEffect.hide();
            this.currentHoverEffect = null;
        }
    }

    /**
     * 显示选中效果
     * @param mesh 六边形网格
     */
    public showSelectEffect(mesh: THREE.Mesh): void {
        if (this.currentSelectEffect) {
            this.currentSelectEffect.hideSelect(); // 隐藏上一个选中效果
        }
        const hoverEffect = this.getHoverEffect(mesh);
        hoverEffect.showSelect();
        this.currentSelectEffect = hoverEffect;
    }

    /**
     * 隐藏选中效果
     */
    public hideSelectEffect(): void {
        if (this.currentSelectEffect) {
            this.currentSelectEffect.hideSelect();
            this.currentSelectEffect = null;
        }
    }

    /**
     * 创建框选矩形面
     */
    public createSelectionRect(): void {
        if (this.selectionRect) return; // 如果已经存在，直接返回

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        this.selectionRect = new THREE.Mesh(geometry, material);
        this.selectionRect.visible = false; // 初始不可见
        this.selectionRect.rotateX(Math.PI / 2);
        //避免干扰
        this.selectionRect.castShadow = false;
        this.selectionRect.receiveShadow = false;
        this.selectionRect.raycast = () => null;
        //尽量让 selectionRect 节省性能
        this.selectionRect.name = 'selectionRect';
        this.selectionRect.matrixAutoUpdate = false;
        this.selectionRect.updateMatrix();
        this.scene.add(this.selectionRect);
    }

    /**
     * 更新框选矩形面
     * @param dragStart 拖动起始位置
     * @param dragEnd 拖动结束位置
     */
    public updateSelectionRect(dragStart: THREE.Vector2, dragEnd: THREE.Vector2): void {
        if (!this.selectionRect) return;
        //打印dragStart,dragEnd
        const minX = Math.min(dragStart.x, dragEnd.x);
        const maxX = Math.max(dragStart.x, dragEnd.x);
        const minY = Math.min(dragStart.y, dragEnd.y);
        const maxY = Math.max(dragStart.y, dragEnd.y);

        const width = (maxX - minX) / window.innerWidth * 2; // 归一化到设备坐标
        const height = (maxY - minY) / window.innerHeight * 2; // 归一化到设备坐标

        // 更新矩形面的位置和大小
        this.selectionRect.scale.set(width * 100, height * 100, 1000);//随便给的值，调试用，总算能看到半透明面了；
        this.selectionRect.position.set(
            (minX + maxX) / window.innerWidth - 1, // 中心点 X
            2,
            -(minY + maxY) / window.innerHeight + 1 // 中心点 Y
        );

        this.selectionRect.updateMatrix();
        this.selectionRect.visible = true;
        console.warn(`updateSelectionRect  (${dragStart.x}, ${dragStart.y})   (${dragEnd.x}, ${dragEnd.y})`)
    }

    /**
     * 移除框选矩形面
     */
    public removeSelectionRect(): void {
        if (this.selectionRect) {
            this.selectionRect.visible = false;
        }
    }

    /**
     * 销毁所有 hover 效果
     */
    public dispose(): void {
        this.hoverEffects.forEach((hoverEffect) => hoverEffect.dispose());
        this.hoverEffects.clear();

        if (this.selectionRect) {
            this.scene.remove(this.selectionRect);
            this.selectionRect = null;
        }
    }
}