import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

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

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);

    createTempCubes(scene, geometry, material);

    const deltaTime = clock.getDelta();

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

function test(){
    //three的点
    const point = new THREE.Vector3(1, 2, 3);
    //three的射线
    const ray = new THREE.Raycaster();
    //three的鼠标
    const mouse = new THREE.Vector2();
    //three的平面
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    //three的交点
    const intersection = new THREE.Vector3();
    //three的矩阵
    const matrix = new THREE.Matrix4();
    //three的四元数
    const quaternion = new THREE.Quaternion();
    //three的欧拉角
    const euler = new THREE.Euler();
    //three的颜色
    const color = new THREE.Color(0xff0000);
    //three的线
    const line = new THREE.Line();  
    
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

