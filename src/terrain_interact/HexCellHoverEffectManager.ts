import * as THREE from 'three';
import { HexCellHoverEffect } from './HexCellHoverEffect';

export class HexCellHoverEffectManager {
    private hoverEffects: Map<THREE.Mesh, HexCellHoverEffect> = new Map(); // 六边形网格与 hover 效果的映射
    private currentHoverEffect: HexCellHoverEffect | null = null; // 当前 hover 的效果
    private currentSelectEffects: HexCellHoverEffect[] = []; // 当前选中的效果


    constructor() {

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
    public showSelectEffect(meshs: THREE.Mesh[]): void {
        this._hideSelectEffect();
        meshs.forEach((mesh) => {
            const hoverEffect = this.getHoverEffect(mesh);
            hoverEffect.showSelect();
            this.currentSelectEffects.push(hoverEffect);
        });
    }

    /**
     * 隐藏选中效果
     */
    public hideSelectEffect(meshs: THREE.Mesh[]): void {
        meshs.forEach((mesh) => {
            const hoverEffect = this.getHoverEffect(mesh);
            hoverEffect.hideSelect();
        });
    }

    private _hideSelectEffect(): void {
        if (this.currentSelectEffects.length != 0) {
            this.currentSelectEffects.forEach(effect => effect.hideSelect()); // 隐藏上一个选中效果
        }
        this.currentSelectEffects.length = 0;
    }

    /**
     * 销毁所有 hover 效果
     */
    public dispose(): void {
        this.hoverEffects.forEach((hoverEffect) => hoverEffect.dispose());
        this.hoverEffects.clear();
    }
}