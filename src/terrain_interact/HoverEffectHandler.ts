import * as THREE from 'three';
import { PoolSystem } from '@/base/PoolSystem';
import { Config } from '@/config';
import { HexCellHoverEffect } from './HexCellHoverEffect';

export class HoverEffectHandler {
    private hoverEffects: Map<string, HexCellHoverEffect> = new Map();
    private pools: PoolSystem = new PoolSystem();

    constructor() {
        this.pools.register("hoverEffect", () => new HexCellHoverEffect(), (o) => o.reset());
    }

    public dispose(): void {
        this.hoverEffects.forEach((effect) => effect.dispose());
        this.hoverEffects.clear();
    }

    public update(deltaTime: number): void {
        this.hoverEffects.forEach(effect => effect.update(deltaTime));
    }

    public showHoverEffect(meshes: THREE.Mesh[]): void {
        meshes.forEach(mesh => {
            const hoverEffect = this.getHoverEffect(mesh);
            hoverEffect.showHover();
        });
    }

    public hideHoverEffect(meshes: THREE.Mesh[]): void {
        meshes.forEach(mesh => {
            if (this.hasHoverEffect(mesh)) {
                const hoverEffect = this.getHoverEffect(mesh);
                hoverEffect.hideHover();
                this.restoreEffect(hoverEffect);
            }
        });
    }

    private hasHoverEffect(mesh: THREE.Mesh): boolean {
        return this.hoverEffects.has(mesh.userData.id);
    }

    private getHoverEffect(mesh: THREE.Mesh): HexCellHoverEffect {
        const id = mesh.userData.id;
        let hoverEffect = this.hoverEffects.get(id);
        if (!hoverEffect) {
            hoverEffect = this.pools.acquire<HexCellHoverEffect>("hoverEffect");
            hoverEffect.init(mesh);
            this.hoverEffects.set(id, hoverEffect);
        }
        return hoverEffect;
    }

    private restoreEffect(effect: HexCellHoverEffect): void {
        if (!Config.isUsePool)
            return;
        const id = effect.useID;
        if (!this.hoverEffects.has(id))
            return;
        this.hoverEffects.delete(id);
        this.pools.release("hoverEffect", effect);
    }
}