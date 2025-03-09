import * as THREE from 'three';

export class PosUtils {
    private static readonly _tempVec3 = new THREE.Vector3();
    private static readonly _tempVec2 = new THREE.Vector2();
    private static readonly _groundPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    private static readonly _raycaster = new THREE.Raycaster();

    /**
     * 将屏幕坐标转换为世界坐标（基于地面平面）
     * @param screenPos 屏幕坐标（像素单位）
     * @param camera 摄像机
     * @param groundPlane 地面平面（默认是 y=0 的平面）
     * @returns 世界坐标
     */
    public static getWorldPos(screenPos: THREE.Vector2, camera: THREE.Camera, groundPlane: THREE.Plane = this._groundPlane): THREE.Vector3 {
        // 将屏幕坐标归一化为设备坐标（-1 到 1）
        this._tempVec2.set(
            (screenPos.x / window.innerWidth) * 2 - 1,
            -(screenPos.y / window.innerHeight) * 2 + 1
        );
        const intersection = new THREE.Vector3();
        this._raycaster.setFromCamera(this._tempVec2, camera);
        this._raycaster.ray.intersectPlane(groundPlane, intersection);
        return intersection;
    }

    /**
     * 将世界坐标转换为屏幕坐标
     * @param worldPos 世界坐标
     * @param camera 摄像机
     * @returns 屏幕坐标（像素单位）
     */
    public static getScreenPos(worldPos: THREE.Vector3, camera: THREE.Camera): THREE.Vector2 {
        // 将世界坐标投影到屏幕坐标
        this._tempVec3.copy(worldPos).project(camera);

        // 将设备坐标（-1 到 1）转换为屏幕坐标（像素单位）
        const screenX = (this._tempVec3.x + 1) * (window.innerWidth / 2);
        const screenY = (-this._tempVec3.y + 1) * (window.innerHeight / 2);

        return new THREE.Vector2(screenX, screenY);
    }
}