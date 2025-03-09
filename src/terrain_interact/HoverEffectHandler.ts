import * as THREE from 'three';
import { PoolSystem } from '@/base/PoolSystem';
import { Config } from '@/config';
import { HexCellInteractEffect } from './HexCellInteractEffect';

export class HoverEffectHandler {
    private hoverEffects: Map<string, HexCellInteractEffect> = new Map();
    private pools: PoolSystem = new PoolSystem();

    constructor() {
        this.pools.register("hoverEffect", () => new HexCellInteractEffect(), (o) => o.reset());
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

    private getHoverEffect(mesh: THREE.Mesh): HexCellInteractEffect {
        const id = mesh.userData.id;
        let hoverEffect = this.hoverEffects.get(id);
        if (!hoverEffect) {
            hoverEffect = this.pools.acquire<HexCellInteractEffect>("hoverEffect");
            hoverEffect.init(mesh);
            this.hoverEffects.set(id, hoverEffect);
        }
        return hoverEffect;
    }

    private restoreEffect(effect: HexCellInteractEffect): void {
        if (!Config.isUsePool) return;
        const id = effect.useID;
        if (!this.hoverEffects.has(id)) return;
        this.hoverEffects.delete(id);
        this.pools.release("hoverEffect", effect);
    }
}