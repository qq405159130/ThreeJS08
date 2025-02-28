import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { MyCameraControls } from './MyCameraControls';





const stats = new Stats();
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);
document.getElementById('app')?.appendChild(renderer.domElement);
camera.position.z = 5;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 初始化摄像机控制
const cameraControls = new MyCameraControls(camera, renderer, scene);

const clock = new THREE.Clock();

function createSky(scene: THREE.Scene) {
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
createSky(scene);

const tempCubes = new Map();
function createTempCubes(scene: THREE.Scene, geometry: THREE.BoxGeometry, material: THREE.MeshBasicMaterial) {
    // Create new temporary cube
    const tempCube = new THREE.Mesh(geometry, material);
    const currentTime = performance.now();
    scene.add(tempCube);
    tempCube.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
    tempCube.scale.set(0.1, 0.1, 0.1);
    tempCubes.set(tempCube, currentTime);
    // Clean up old temporary cubes (after 10 seconds)
    tempCubes.forEach((creationTime, cube) => {
        if (currentTime - creationTime >= 10000) { // 10 seconds
            scene.remove(cube);
            tempCubes.delete(cube);
        }
    });
}

function debugHelpers(scene: THREE.Scene) {
    //使用AxesHelper辅助工具
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    //使用GridHelper辅助工具
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    //使用ArrowHelper辅助工具
    const arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2, 0xffff00);
    scene.add(arrowHelper);
    //使用CameraHelper辅助工具
    const cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);
    //使用PointLightHelper辅助工具
    const pointLightHelper = new THREE.PointLightHelper(new THREE.PointLight(0xffffff, 1, 100));
    scene.add(pointLightHelper);
    //使用DirectionalLightHelper辅助工具
    const directionalLightHelper = new THREE.DirectionalLightHelper(new THREE.DirectionalLight(0xffffff, 1));
    scene.add(directionalLightHelper);
    //使用SpotLightHelper辅助工具
    const spotLightHelper = new THREE.SpotLightHelper(new THREE.SpotLight(0xffffff, 1));
    scene.add(spotLightHelper);
    //使用HemisphereLightHelper辅助工具
    const hemisphereLightHelper = new THREE.HemisphereLightHelper(new THREE.HemisphereLight(0xffffff, 1, 10), 5);
    scene.add(hemisphereLightHelper);
    // //使用SkeletonHelper辅助工具 (报错，先注释了)
    // const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
    // const skeletonHelper = new THREE.SkeletonHelper(skinnedMesh);
    // scene.add(skinnedMesh);
    // scene.add(skeletonHelper);
    //使用EdgesHelper辅助工具
    const edges = new THREE.EdgesGeometry(cube.geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
    scene.add(line);
    //使用WireframeHelper辅助工具
    const wireframe = new THREE.WireframeGeometry(cube.geometry);
    const wireframeLine = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
    scene.add(wireframeLine);
    //使用BoxHelper辅助工具
    const boxHelper = new THREE.BoxHelper(cube, 0x00ff00);
    scene.add(boxHelper);
    //使用PlaneHelper辅助工具
    const planeHelper = new THREE.PlaneHelper(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), 10, 0x00ff00);
    scene.add(planeHelper);
}
debugHelpers(scene);

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);

    createTempCubes(scene, geometry, material);

    const deltaTime = clock.getDelta();
    cameraControls.update(deltaTime);// 更新摄像机控制

    stats.end();
}
animate();

// 处理窗口大小变化
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    renderer.setSize(width, height);
    // 强制渲染
    renderer.render(scene, camera);

}

// 监听窗口大小变化
window.addEventListener('resize', handleResize);

// 监听全屏状态变化
document.addEventListener('fullscreenchange', () => {
    handleResize();
    //重新渲染
    renderer.render(scene, camera);
});


document.getElementById('start-message')?.remove();

