// game/src/map/LODSystem.ts
import * as THREE from 'three';

export class MapLODSystem {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private meshes: THREE.Mesh[];
    private lodDistance: number = 20; // LOD切换距离

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.scene = scene;
        this.camera = camera;
        this.meshes = [];
    }

    /**
     * 添加网格
     * @param mesh 网格
     */
    public addMesh(mesh: THREE.Mesh): void {
        this.meshes.push(mesh);
    }

    /**
     * 更新LOD
     */
    public update(): void {
        this.meshes.forEach(mesh => {
            const distance = mesh.position.distanceTo(this.camera.position);
            if (distance > this.lodDistance) {
                mesh.scale.set(0.5, 0.5, 0.5); // 低细节
            } else {
                mesh.scale.set(1, 1, 1); // 高细节
            }
        });
    }
}