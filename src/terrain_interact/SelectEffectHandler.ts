import * as THREE from 'three';
import { PoolSystem } from '@/base/PoolSystem';
import { Config } from '@/config';
import { HexCellInteractEffect } from './HexCellInteractEffect';

export class SelectEffectHandler {
    private selectEffects: Map<string, HexCellInteractEffect> = new Map();
    private pools: PoolSystem = new PoolSystem();

    constructor() {
        this.pools.register("selectEffect", () => new HexCellInteractEffect(), (o) => o.reset());
    }

    public dispose(): void {
        this.selectEffects.forEach((effect) => effect.dispose());
        this.selectEffects.clear();
    }

    public update(deltaTime: number): void {
        this.selectEffects.forEach(effect => effect.update(deltaTime));
    }

    public showSelectEffect(meshes: THREE.Mesh[]): void {
        meshes.forEach(mesh => {
            const selectEffect = this.getSelectEffect(mesh);
            selectEffect.showSelect();
        });
    }

    public hideSelectEffect(meshes: THREE.Mesh[]): void {
        meshes.forEach(mesh => {
            if (this.hasSelectEffect(mesh)) {
                const selectEffect = this.getSelectEffect(mesh);
                selectEffect.hideSelect();
                this.restoreEffect(selectEffect);
            }
        });
    }

    private hasSelectEffect(mesh: THREE.Mesh): boolean {
        return this.selectEffects.has(mesh.userData.id);
    }

    private getSelectEffect(mesh: THREE.Mesh): HexCellInteractEffect {
        const id = mesh.userData.id;
        let selectEffect = this.selectEffects.get(id);
        if (!selectEffect) {
            selectEffect = this.pools.acquire<HexCellInteractEffect>("selectEffect");
            selectEffect.init(mesh);
            this.selectEffects.set(id, selectEffect);
        }
        return selectEffect;
    }

    private restoreEffect(effect: HexCellInteractEffect): void {
        if (!Config.isUsePool) return;
        const id = effect.useID;
        if (!this.selectEffects.has(id)) return;
        this.selectEffects.delete(id);
        this.pools.release("selectEffect", effect);
    }
}