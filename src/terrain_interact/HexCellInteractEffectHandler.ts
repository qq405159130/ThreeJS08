import * as THREE from 'three';
import { HexCellInteractEffect } from './HexCellInteractEffect';
// import { Pool } from 'object-pool';

export class HexCellInteractEffectHandler {
    private hoverEffects: Map<THREE.Mesh, HexCellInteractEffect> = new Map(); // 六边形网格与 hover 效果的映射
    private currentHoverEffect: HexCellInteractEffect[] = []; // 当前 hover 的效果
    private currentSelectEffects: HexCellInteractEffect[] = []; // 当前选中的效果

    // private pool: Pool<HexCellHoverEffect> = new Pool();

    constructor() {

    }

    /**
     * 获取或创建 hover 效果
     * @param mesh 六边形网格
     * @returns hover 效果
     */
    private getHoverEffect(mesh: THREE.Mesh): HexCellInteractEffect {
        let hoverEffect = this.hoverEffects.get(mesh);
        if (!hoverEffect) {
            hoverEffect = new HexCellInteractEffect();
            hoverEffect.init(mesh);
            this.hoverEffects.set(mesh, hoverEffect);
        }
        return hoverEffect;

        // let hoverEffect = this.pool.acquire();
        // hoverEffect.init(mesh);
        // return hoverEffect;
    }

    private restoreEffect(effect: HexCellInteractEffect): void {
        // this.pool.release(effect);
    }

    /**
     * 显示 hover 效果
     * @param mesh 六边形网格
     */
    public showHoverEffect(meshs: THREE.Mesh[]): void {
        // this._hideHoverEffect();
        meshs.forEach(mesh => {
            const hoverEffect = this.getHoverEffect(mesh);
            hoverEffect.showHover();
            this.currentHoverEffect.push(hoverEffect);
        });
    }

    /**
     * 隐藏 hover 效果
     */
    public hideHoverEffect(meshs: THREE.Mesh[]): void {
        meshs.forEach((mesh) => {
            const hoverEffect = this.getHoverEffect(mesh);
            hoverEffect.hideHover();
            this.restoreEffect(hoverEffect);
        });
    }


    private _hideHoverEffect(): void {
        if (this.currentHoverEffect.length != 0) {
            this.currentHoverEffect.forEach(effect => {
                effect.hideHover();
                this.restoreEffect(effect);
            });
        }
        this.currentHoverEffect.length = 0;
    }


    /**
     * 显示选中效果
     * @param mesh 六边形网格
     */
    public showSelectEffect(meshs: THREE.Mesh[]): void {
        // this._hideSelectEffect();
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
            this.restoreEffect(hoverEffect);
        });
    }

    private _hideSelectEffect(): void {
        if (this.currentSelectEffects.length != 0) {
            this.currentSelectEffects.forEach(effect => {
                effect.hideSelect();
                this.restoreEffect(effect);
            }); // 隐藏上一个选中效果
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