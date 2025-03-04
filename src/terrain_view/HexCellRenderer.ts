// import * as THREE from 'three';
// import { Config } from '../config';

// export class HexCellRenderer {
//     private scene: THREE.Scene;
//     private instancedMesh: THREE.InstancedMesh | null = null;
//     private meshes: THREE.Mesh[] = [];
//     private geometry: THREE.BufferGeometry;
//     private material: THREE.Material;
//     private instanceCount: number = 0;
//     private instanceMatrices: THREE.Matrix4[] = [];
//     private instanceColors: THREE.Color[] = [];

//     constructor(scene: THREE.Scene) {
//         this.scene = scene;
//         this.geometry = new THREE.CylinderGeometry(1, 1, 0.1, 6); // 六边形几何体
//         this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     }

//     /**
//      * 添加一个六边形网格
//      * @param q 列坐标
//      * @param r 行坐标
//      * @param color 颜色
//      */
//     public addCell(q: number, r: number, color: THREE.Color): void {
//         const x = 1.5 * q;
//         const z = Math.sqrt(3) * (r + q / 2);
//         const matrix = new THREE.Matrix4().setPosition(x, 0, z);
//         //设置matrix旋转，使之绕y轴旋转90°  
//         matrix.multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2));

//         if (Config.useInstancedMesh) {
//             // 使用 InstancedMesh
//             if (!this.instancedMesh) {
//                 this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, 1000);
//                 this.scene.add(this.instancedMesh);
//             }
//             this.instanceMatrices.push(matrix);
//             this.instanceColors.push(color);
//             this.updateInstances();
//         } else {
//             // 使用普通 Mesh
//             const mesh = new THREE.Mesh(this.geometry, this.material);
//             mesh.position.set(x, 0, z);
//             mesh.rotation.y = -Math.PI / 2;
//             mesh.userData = { q, r }; // 保存单元格坐标
//             this.meshes.push(mesh);
//             this.scene.add(mesh);
//         }
//     }

//     /**
//      * 更新 InstancedMesh 的实例数据
//      */
//     private updateInstances(): void {
//         if (this.instancedMesh) {
//             this.instancedMesh.count = this.instanceMatrices.length;
//             this.instanceMatrices.forEach((matrix, index) => {
//                 this.instancedMesh!.setMatrixAt(index, matrix);
//                 this.instancedMesh!.setColorAt(index, this.instanceColors[index]);
//             });
//             this.instancedMesh.instanceMatrix.needsUpdate = true;
//             if (this.instancedMesh.instanceColor) {
//                 this.instancedMesh.instanceColor.needsUpdate = true;
//             }
//         }
//     }

//     /**
//      * 获取所有六边形网格
//      */
//     public getMeshs(): THREE.Mesh[] {
//         if (Config.useInstancedMesh) {
//             // InstancedMesh 无法直接返回单个实例，返回空数组
//             return [];
//         } else {
//             return this.meshes;
//         }
//     }

//     /**
//      * 清理所有六边形网格
//      */
//     public clear(): void {
//         if (this.instancedMesh) {
//             this.scene.remove(this.instancedMesh);
//             this.instancedMesh = null;
//         }
//         this.meshes.forEach(mesh => this.scene.remove(mesh));
//         this.meshes = [];
//         this.instanceMatrices = [];
//         this.instanceColors = [];
//     }
// }