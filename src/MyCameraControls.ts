import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class MyCameraControls {
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private pointerLockControls: PointerLockControls;
    private orbitControls: OrbitControls;

    // 模式枚举
    private static MODE = {
        POINTER_LOCK: 0, // 指针锁定模式
        ORBIT: 1,        // 轨道控制模式
        EDGE_PAN: 2      // 边缘推动平移模式
    };

    private currentMode: number = MyCameraControls.MODE.POINTER_LOCK; // 当前模式
    public static isPointerLocked: boolean = false; // 指针锁定状态

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
    private moveSpeed: number = 10; // 移动速度
    private smoothFactor: number = 0.1; // 平滑因子

    // 边缘推动平移参数
    private edgePanMargin: number = 10; // 边缘推动的边界距离（像素）
    private edgePanSpeed: number = 5;   // 边缘推动的速度

    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;

        // 初始化PointerLockControls
        this.pointerLockControls = new PointerLockControls(this.camera, this.renderer.domElement);
        this.scene.add(this.pointerLockControls.object);

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

        // 监听鼠标点击事件
        window.addEventListener('click', (event) => {
            if (MyCameraControls.isPointerLocked) return;
            const canvas = this.renderer.domElement;
            const rect = canvas.getBoundingClientRect();
            // 检查点击事件是否发生在画布区域内
            if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
                this.enablePointerLock();
            }
        });

        // 监听鼠标移动事件（用于边缘推动平移模式）
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    // 切换模式
    private switchMode(): void {
        this.currentMode = (this.currentMode + 1) % 3; // 循环切换三种模式
        console.log(`Switched to mode: ${this.currentMode}`);

        // 根据模式启用/禁用控件
        if (this.currentMode === MyCameraControls.MODE.POINTER_LOCK) {
            this.orbitControls.enabled = false;
            this.enablePointerLock();
        } else if (this.currentMode === MyCameraControls.MODE.ORBIT) {
            this.disablePointerLock();
            this.orbitControls.enabled = true;
        } else if (this.currentMode === MyCameraControls.MODE.EDGE_PAN) {
            this.disablePointerLock();
            this.orbitControls.enabled = false;
        }
    }

    // 处理鼠标移动事件（用于边缘推动平移模式）
    private onMouseMove(event: MouseEvent): void {
        if (this.currentMode !== MyCameraControls.MODE.EDGE_PAN) return;
        console.warn(`Mouse move      mode(${this.currentMode})   event: ${event}`);
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // 计算鼠标是否在边缘
        const isLeftEdge = mouseX < this.edgePanMargin;
        const isRightEdge = mouseX > rect.width - this.edgePanMargin;
        const isTopEdge = mouseY < this.edgePanMargin;
        const isBottomEdge = mouseY > rect.height - this.edgePanMargin;

        // 根据边缘推动摄像机
        if (isLeftEdge) {
            this.targetVelocity.x = -this.edgePanSpeed;
        } else if (isRightEdge) {
            this.targetVelocity.x = this.edgePanSpeed;
        } else {
            this.targetVelocity.x = 0;
        }

        if (isTopEdge) {
            this.targetVelocity.z = -this.edgePanSpeed;
        } else if (isBottomEdge) {
            this.targetVelocity.z = this.edgePanSpeed;
        } else {
            this.targetVelocity.z = 0;
        }
    }

    // 处理PointerLockControls的锁定状态变化
    private onPointerLockChange(): void {
        MyCameraControls.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
        console.warn('Pointer lock state:', MyCameraControls.isPointerLocked);
        if (!MyCameraControls.isPointerLocked) {
            // 退出PointerLock时重置键盘状态
            this.moveForward = false;
            this.moveBackward = false;
            this.moveLeft = false;
            this.moveRight = false;
            this.moveUp = false;
            this.moveDown = false;
        }
    }

    // 处理键盘按下事件
    private onKeyDown(event: KeyboardEvent): void {
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
            case 'KeyT': // 切换模式
                this.switchMode();
                break;
        }
    }

    // 处理键盘松开事件
    private onKeyUp(event: KeyboardEvent): void {
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

    // 启用PointerLock
    public enablePointerLock(): void {
        this.pointerLockControls.lock();
    }

    // 禁用PointerLock
    public disablePointerLock(): void {
        this.pointerLockControls.unlock();
    }

    // 更新摄像机控制
    public update(deltaTime: number): void {
        if (this.currentMode === MyCameraControls.MODE.POINTER_LOCK && MyCameraControls.isPointerLocked) {
            // 指针锁定模式
            this.orbitControls.enabled = false;
            this.updatePer(deltaTime);
        } else if (this.currentMode === MyCameraControls.MODE.ORBIT) {
            // 轨道控制模式
            this.orbitControls.enabled = true;
            this.orbitControls.update();
        } else if (this.currentMode === MyCameraControls.MODE.EDGE_PAN) {
            // 边缘推动平移模式
            this.orbitControls.enabled = false;
            this.updatePer(deltaTime);
        }
    }

    // 更新摄像机位置
    private updatePer(deltaTime: number): void {
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
        if (this.velocity.distanceTo(this.targetVelocity) < 0.01) {
            this.velocity.copy(this.targetVelocity);
        }

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
    }
}