import * as THREE from 'three';
import { HexCellInteractEffect } from './HexCellInteractEffect';
import { PoolSystem } from '@/base/PoolSystem';
import { Config } from '@/config';
// import { Pool } from 'object-pool'; //需要在项目中安装插件//yarn add object-pool //yarn add @types/object-pool --dev
//想安装但失败了 //yarn add three-pool-manager yarn add @types/three-pool-manager --dev


export class HexCellInteractEffectHandler {
    private hoverEffects: Map<string, HexCellInteractEffect> = new Map(); // 六边形网格与 hover 效果的映射
    private currentHoverEffect: HexCellInteractEffect[] = []; // 当前 hover 的效果
    private currentSelectEffects: HexCellInteractEffect[] = []; // 当前选中的效果

    private pools: PoolSystem = new PoolSystem();

    constructor() {
        this.pools.register("interactView", () => new HexCellInteractEffect(),
            (o) => { o.reset(); });
    }


    /**
     * 销毁所有 hover 效果
     */
    public dispose(): void {
        this.hoverEffects.forEach((hoverEffect) => hoverEffect.dispose());
        this.hoverEffects.clear();
    }

    public update(deltaTime: number): void {
        this.currentHoverEffect.forEach(effect => effect.update(deltaTime));
        this.currentSelectEffects.forEach(effect => effect.update(deltaTime));
    }

    private hasHoverEffect(mesh: THREE.Mesh): boolean {
        let id = mesh.userData.id;
        return this.hoverEffects.has(id);
    }

    /**
     * 获取或创建 hover 效果
     * @param mesh 六边形网格
     * @returns hover 效果
     */
    private getHoverEffect(mesh: THREE.Mesh): HexCellInteractEffect {
        let id = mesh.userData.id;
        if (!Config.isUsePool) {
            let hoverEffect = this.hoverEffects.get(id);
            if (!hoverEffect) {
                hoverEffect = new HexCellInteractEffect();
                hoverEffect.init(mesh);
                hoverEffect.useID = id;
                this.hoverEffects.set(id, hoverEffect);
            }
            return hoverEffect;
        }

        let hoverEffect = this.hoverEffects.get(id);
        if (!hoverEffect) {
            console.warn(`acquireEffect 1 size:  ${this.pools.size("interactView")}   this.hoverEffects:${Array.from(this.hoverEffects.values()).length}`);
            hoverEffect = this.pools.acquire<HexCellInteractEffect>("interactView");
            console.warn("acquireEffect 2 size:", this.pools.size("interactView"));
            hoverEffect.init(mesh);
            this.hoverEffects.set(id, hoverEffect);
        }
        return hoverEffect;
    }

    private restoreEffect(effect: HexCellInteractEffect): void {
        if (!Config.isUsePool) {
            return;
        }
        let id = effect.useID;
        if (!this.hoverEffects.has(id)) {
            return;
        }
        this.hoverEffects.delete(id);
        console.warn(`restoreEffect 1  size:  ${this.pools.size("interactView")}   this.hoverEffects:${Array.from(this.hoverEffects.values()).length}`);
        this.pools.release("interactView", effect);
        console.warn(`restoreEffect 2 size:  ${this.pools.size("interactView")}   this.hoverEffects:${Array.from(this.hoverEffects.values()).length}`);
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
            if (this.hasHoverEffect(mesh)) {
                const hoverEffect = this.getHoverEffect(mesh);
                hoverEffect.hideHover();
                this.restoreEffect(hoverEffect);
            }
        });

        // this.currentHoverEffect.indexOf()
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

}