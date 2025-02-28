import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class MyCameraControls {
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private pointerLockControls: PointerLockControls;
    private orbitControls: OrbitControls;
    private isPointerLocked: boolean = false;

    // 键盘状态
    private moveForward: boolean = false;
    private moveBackward: boolean = false;
    private moveLeft: boolean = false;
    private moveRight: boolean = false;
    private moveUp: boolean = false;
    private moveDown: boolean = false;

    // 移动速度
    private velocity: THREE.Vector3 = new THREE.Vector3();
    private targetVelocity: THREE.Vector3 = new THREE.Vector3(); // 目标速度
    private moveSpeed: number = 5; // 移动速度
    private smoothFactor: number = 0.1; // 平滑因子

    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;

        // 初始化PointerLockControls
        this.pointerLockControls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.scene.add(this.pointerLockControls.getObject());

        // 初始化OrbitControls
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true; // 启用阻尼效果
        this.orbitControls.dampingFactor = 0.05; // 阻尼系数
        this.orbitControls.screenSpacePanning = true; // 允许在屏幕空间平移
        this.orbitControls.minDistance = 1; // 最小缩放距离
        this.orbitControls.maxDistance = 100; // 最大缩放距离

        // 监听PointerLockControls的锁定状态变化
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this), false);

        // 监听键盘事件
        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);

        // 点击画布时启用PointerLockControls
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                this.enablePointerLock();
            }
        });

        // 确保在页面加载后立即监听点击事件
        window.addEventListener('load', () => {
            this.renderer.domElement.removeEventListener('click', this.onRenderClick.bind(this));
            this.renderer.domElement.addEventListener('click', this.onRenderClick.bind(this));
        });
    }

    private onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
        if (!this.isPointerLocked) {
            // 退出PointerLock时重置键盘状态
            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;
            this.moveUp = false;
            this.moveDown = false;

            // 重新启用点击事件监听
            this.renderer.domElement.removeEventListener('click', this.onRenderClick.bind(this));
            this.renderer.domElement.addEventListener('click', this.onRenderClick.bind(this));
        }
    }

    private onRenderClick() {
        if (!this.isPointerLocked) {
            this.enablePointerLock();
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyW': // 向前移动
                this.moveForward = true;
                break;
            case 'KeyS': // 向后移动
                this.moveBackward = true;
                break;
            case 'KeyA': // 向左移动
                this.moveLeft = true;
                break;
            case 'KeyD': // 向右移动
                this.moveRight = true;
                break;
            case 'KeyR': // 上升
                this.moveUp = true;
                break;
            case 'KeyF': // 下降
                this.moveDown = true;
                break;
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'KeyD':
                this.moveRight = false;
                break;
            case 'KeyR':
                this.moveUp = false;
                break;
            case 'KeyF':
                this.moveDown = false;
                break;
        }
    }

    public enablePointerLock() {
        this.pointerLockControls.lock();
    }

    public disablePointerLock() {
        this.pointerLockControls.unlock();
    }

    public update(deltaTime: number) {
        if (this.isPointerLocked) {
            // 如果启用了PointerLockControls，则禁用OrbitControls
            this.orbitControls.enabled = false;

            // 根据键盘状态更新目标速度
            this.targetVelocity.set(0, 0, 0);

            if (this.moveForward) this.targetVelocity.z += this.moveSpeed * deltaTime;
            if (this.moveBackward) this.targetVelocity.z -= this.moveSpeed * deltaTime;
            if (this.moveLeft) this.targetVelocity.x += this.moveSpeed * deltaTime;
            if (this.moveRight) this.targetVelocity.x -= this.moveSpeed * deltaTime;
            if (this.moveUp) this.targetVelocity.y += this.moveSpeed * deltaTime;
            if (this.moveDown) this.targetVelocity.y -= this.moveSpeed * deltaTime;

            // 平滑速度
            this.velocity.lerp(this.targetVelocity, this.smoothFactor);

            // 将速度向量转换为摄像机本地坐标系
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            direction.y = 0; // 保持水平移动
            direction.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(this.camera.up, direction).normalize();

            // 更新摄像机位置
            this.camera.position.add(direction.multiplyScalar(this.velocity.z));
            this.camera.position.add(right.multiplyScalar(this.velocity.x));
            this.camera.position.y += this.velocity.y;
        } else {
            // 否则启用OrbitControls
            this.orbitControls.enabled = true;
            this.orbitControls.update();
        }
    }
}