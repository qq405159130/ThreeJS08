// import { Camera } from '@react-three/fiber';
// import * as THREE from 'three';

// export class PosUtils {
//     private static readonly _raycaster = new THREE.Raycaster();
//     private static readonly _normalizedPos = new THREE.Vector2();
//     /** 表示地面（Y=0） */
//     private static readonly _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

//     /** 屏幕坐标转为世界坐标，高度为0 */
//     public static getWorldPos(pos2d: THREE.Vector2, camera: Camera): THREE.Vector3 {
//         // 将屏幕坐标归一化到 [-1, 1] 的范围
//         this._normalizedPos.set(0, 0);
//         this._normalizedPos.x = (pos2d.x / window.innerWidth) * 2 - 1;
//         this._normalizedPos.y = -(pos2d.y / window.innerHeight) * 2 + 1;
//         // 设置射线投射器的起点和方向
//         this._raycaster.setFromCamera(this._normalizedPos, camera);
//         // 计算射线与平面的交点
//         const intersection = new THREE.Vector3();
//         this._raycaster.ray.intersectPlane(this._plane, intersection);
//         return intersection;
//     }

//     /** 世界坐标转为屏幕坐标 */
//     public static getScreenPos(pos3d: THREE.Vector3, camera: Camera): THREE.Vector2 {
//         // 将世界坐标转换为屏幕坐标
//         const vector = pos3d.clone().project(camera);
//         // 将归一化坐标转换为屏幕坐标
//         const screenPos = new THREE.Vector2();
//         screenPos.x = Math.round((vector.x + 1) * window.innerWidth / 2);
//         screenPos.y = Math.round((-vector.y + 1) * window.innerHeight / 2);
//         return screenPos;
//     }
// }