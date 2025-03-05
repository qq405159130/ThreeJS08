
import * as THREE from 'three';

export class HexCellRectSelectView {

    // 框选矩形面
    private selectionRect: THREE.Mesh | null = null;
    private scene: THREE.Scene;

    /** 使用 Raycaster 计算射线与场景的交点 */
    private raycaster = new THREE.Raycaster();
    /** 创建一个平面（例如地面） */
    private intersectPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    /** 射线起点 */
    private startPoint = new THREE.Vector3();
    /** 射线终点 */
    private endPoint = new THREE.Vector3();


    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public dispose(): void {
        if (this.selectionRect) {
            this.scene.remove(this.selectionRect);
            this.selectionRect = null;
        }
    }

    /**
     * 创建框选矩形面
     */
    public createSelectionRect(): void {
        if (this.selectionRect) return; // 如果已经存在，直接返回

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        this.selectionRect = new THREE.Mesh(geometry, material);
        this.selectionRect.visible = false; // 初始不可见
        this.selectionRect.rotateX(Math.PI / 2);
        //避免干扰
        this.selectionRect.castShadow = false;
        this.selectionRect.receiveShadow = false;
        this.selectionRect.raycast = () => null;
        //尽量让 selectionRect 节省性能
        this.selectionRect.name = 'selectionRect';
        this.selectionRect.matrixAutoUpdate = false;
        this.selectionRect.updateMatrix();
        this.scene.add(this.selectionRect);
    }

    /**
     * 更新框选矩形面
     * @param dragStart 拖动起始位置
     * @param dragEnd 拖动结束位置
     */
    public updateSelectionRect(dragStart: THREE.Vector2, dragEnd: THREE.Vector2, camera: THREE.Camera): void {
        if (!this.selectionRect)
            return;

        // 将屏幕坐标归一化为设备坐标（-1 到 1）
        const startNormalized = new THREE.Vector2(
            (dragStart.x / window.innerWidth) * 2 - 1,
            -(dragStart.y / window.innerHeight) * 2 + 1
        );
        const endNormalized = new THREE.Vector2(
            (dragEnd.x / window.innerWidth) * 2 - 1,
            -(dragEnd.y / window.innerHeight) * 2 + 1
        );

        // 计算起点
        this.raycaster.setFromCamera(startNormalized, camera);
        this.raycaster.ray.intersectPlane(this.intersectPlane, this.startPoint);
        // 计算终点
        this.raycaster.setFromCamera(endNormalized, camera);
        this.raycaster.ray.intersectPlane(this.intersectPlane, this.endPoint);
        const sp = this.startPoint;
        const ep = this.endPoint;

        // 计算框选范围的中心点和大小
        const center = new THREE.Vector3().addVectors(sp, ep).multiplyScalar(0.5);
        center.y = 0.5;//提升一定高度，要盖住其他物体；
        const size = new THREE.Vector3(
            Math.abs(ep.x - sp.x),
            Math.abs(ep.z - sp.z),//调试出来的，反正y的插值是0，不可用。具体原因不知道。
            1,//厚度不能为0
        );

        // 更新框选平面的位置和大小
        this.selectionRect.position.copy(center);
        this.selectionRect.scale.copy(size);
        // this.selectionRect.lookAt(camera.position); // 确保平面朝向摄像机 //不行，3D物体还是别想完全模拟2D了
        this.selectionRect.updateMatrix();//缩放后就得调用这句；

        this.selectionRect.visible = true;
        // console.warn(`updateSelectionRect:  size(${size.x.toFixed(0)}, ${size.y.toFixed(0)}, ${size.z.toFixed(0)})  `
        //     + ` center (${center.x.toFixed(0)}, ${center.y.toFixed(0)}, ${center.z.toFixed(0)}),  `
        //     + ` start (${sp.x.toFixed(0)}, ${sp.y.toFixed(0)}, ${sp.z.toFixed(0)}), end (${ep.x.toFixed(0)}, ${ep.y.toFixed(0)}, ${ep.z.toFixed(0)})`
        // );//调试用的log
    }
    /**
     * 移除框选矩形面
     */
    public removeSelectionRect(): void {
        if (this.selectionRect) {
            this.selectionRect.visible = false;
        }
    }

}