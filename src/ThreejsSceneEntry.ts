import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { MyCameraControls } from './MyCameraControls';
import { ServiceManager } from './utils/ServiceManager';
import { eSceneMount, SceneManager } from './SceneManager';
import { Config } from './config';

export class ThreejsSceneTest {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private stats: Stats;
    private cameraControls: MyCameraControls;
    private clock: THREE.Clock;
    private tempCubes: Map<THREE.Mesh, number> = new Map();
    private isInitialized: boolean = false; // 初始化标志

    private serviceManager?: ServiceManager;

    constructor() {
        // 初始化场景、相机、渲染器
        this.scene = new THREE.Scene();
        SceneManager.init(this.scene);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });//启用 WebGL 渲染器的抗锯齿，以提高渲染质量
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('app')?.appendChild(this.renderer.domElement);
        // this.renderer.sortObjects = true; // 确保物体按深度排序

        const light = new THREE.DirectionalLight(0xffffff, 10);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        // 设置相机位置
        this.camera.position.set(0, 20, 20);
        this.camera.lookAt(0, 0, 0);

        // 初始化调试工具
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        // 初始化摄像机控制

        this.cameraControls = new MyCameraControls(this.camera, this.renderer, this.scene);

        // 初始化时钟
        this.clock = new THREE.Clock();

        // 设置场景背景
        this.scene.background = new THREE.Color(0xffffff);

        // 添加调试辅助工具
        Config.isDebugTool && this.debugHelpers();

        // 初始化地图渲染测试
        // this.initMapRenderTest();

        this.createSky(this.scene);

        this.initService();

        // 标记初始化完成
        this.isInitialized = true;
    }

    public animate(): void {
        if (!this.isInitialized) return; // 如果未初始化完成，跳过渲染

        this.stats.begin();

        // 更新摄像机控制
        const deltaTime = this.clock.getDelta();
        this.cameraControls.update(deltaTime);

        // 创建临时立方体
        Config.isCreateTempCubes && this.createTempCubes();

        // 渲染场景
        this.renderer.render(this.scene, this.camera);

        this.updateService(deltaTime);

        this.stats.end();
        requestAnimationFrame(() => this.animate());
    }


    public handleResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderer.render(this.scene, this.camera);
    }

    private initService(): void {

        this.serviceManager = ServiceManager.getInstance();
        this.serviceManager.initialize(this.scene, this.camera, this.renderer);
    }

    private updateService(deltaTime: number): void {
        this.serviceManager?.updateFrame(deltaTime);
    }

    private debugHelpers(): void {
        //使用AxesHelper辅助工具
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        //使用GridHelper辅助工具
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);
        //使用ArrowHelper辅助工具
        const arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2, 0xffff00);
        this.scene.add(arrowHelper);
        //使用PlaneHelper辅助工具
        const planeHelper = new THREE.PlaneHelper(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), 10, 0x00ff00);
        this.scene.add(planeHelper);

        //使用CameraHelper辅助工具
        const cameraHelper = new THREE.CameraHelper(this.camera);
        this.scene.add(cameraHelper);

        //使用PointLightHelper辅助工具
        const pointLightHelper = new THREE.PointLightHelper(new THREE.PointLight(0xffffff, 1, 100));
        this.scene.add(pointLightHelper);
        //使用DirectionalLightHelper辅助工具
        const directionalLightHelper = new THREE.DirectionalLightHelper(new THREE.DirectionalLight(0xffffff, 1));
        this.scene.add(directionalLightHelper);
        //使用SpotLightHelper辅助工具
        const spotLightHelper = new THREE.SpotLightHelper(new THREE.SpotLight(0xffffff, 1));
        this.scene.add(spotLightHelper);
        //使用HemisphereLightHelper辅助工具
        const hemisphereLightHelper = new THREE.HemisphereLightHelper(new THREE.HemisphereLight(0xffffff, 1, 10), 5);
        this.scene.add(hemisphereLightHelper);

        // //使用SkeletonHelper辅助工具 (报错，先注释了)
        // const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
        // const skeletonHelper = new THREE.SkeletonHelper(skinnedMesh);
        // this.scene.add(skinnedMesh);
        // this.scene.add(skeletonHelper);
    }

    private debugHelperForCube(cube: THREE.Mesh): void {
        //使用EdgesHelper辅助工具
        const edges = new THREE.EdgesGeometry(cube.geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        this.scene.add(line);
        //使用WireframeHelper辅助工具
        const wireframe = new THREE.WireframeGeometry(cube.geometry);
        const wireframeLine = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        this.scene.add(wireframeLine);
        //使用BoxHelper辅助工具
        const boxHelper = new THREE.BoxHelper(cube, 0x00ff00);
        this.scene.add(boxHelper);
    }



    private createTempCubes(): void {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const tempCube = new THREE.Mesh(geometry, material);
        const currentTime = performance.now();
        SceneManager.get(eSceneMount.bullet).add(tempCube);
        tempCube.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
        tempCube.scale.set(0.1, 0.1, 0.1);
        tempCube.castShadow = false;
        tempCube.receiveShadow = false;
        tempCube.raycast = () => false;
        this.tempCubes.set(tempCube, currentTime);

        // 清理旧的临时立方体
        this.tempCubes.forEach((creationTime, cube) => {
            if (currentTime - creationTime >= 10000) { // 10 seconds
                SceneManager.get(eSceneMount.bullet).remove(cube);
                this.tempCubes.delete(cube);
            }
        });
    }

    private createSky(scene: THREE.Scene) {
        const skyboxTexture = new THREE.CubeTextureLoader()
            .load([
                'https://threejs.org/examples/textures/cube/Park3Med/px.jpg',
                'https://threejs.org/examples/textures/cube/Park3Med/nx.jpg',
                'https://threejs.org/examples/textures/cube/Park3Med/py.jpg',
                'https://threejs.org/examples/textures/cube/Park3Med/ny.jpg',
                'https://threejs.org/examples/textures/cube/Park3Med/pz.jpg',
                'https://threejs.org/examples/textures/cube/Park3Med/nz.jpg'
            ]);
        scene.background = skyboxTexture;
    }

}