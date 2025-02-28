
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
    }

    private onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    }

    private onKeyDown(event: KeyboardEvent) {
        console.warn(`Key down: ${event.code}   ${this.isPointerLocked}`);
        if (this.isPointerLocked) {
            switch (event.code) {
                case 'KeyW': // 向前移动
                    this.pointerLockControls.moveForward(0.1);
                    break;
                case 'KeyS': // 向后移动
                    this.pointerLockControls.moveForward(-0.1);
                    break;
                case 'KeyA': // 向左移动
                    this.pointerLockControls.moveRight(-0.1);
                    break;
                case 'KeyD': // 向右移动
                    this.pointerLockControls.moveRight(0.1);
                    break;
            }
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        // 可以在这里处理按键释放的逻辑
    }

    public enablePointerLock() {
        this.pointerLockControls.lock();
    }

    public disablePointerLock() {
        this.pointerLockControls.unlock();
    }

    public update() {
        if (this.isPointerLocked) {
            // 如果启用了PointerLockControls，则禁用OrbitControls
            this.orbitControls.enabled = false;
        } else {
            // 否则启用OrbitControls
            this.orbitControls.enabled = true;
            this.orbitControls.update();
        }
    }
}