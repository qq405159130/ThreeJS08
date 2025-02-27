/** Could not find a declaration file for module 'threejs-miniprogram'. 'e:/Project/ThreeJS/ThreeJs07/game/node_modules/threejs-miniprogram/dist/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/threejs-miniprogram` if it exists or add a new declaration (.d.ts) file containing `declare module 'threejs-miniprogram';`ts(7016) */
import * as THREE from 'three';
import wx from 'weixin-js-sdk';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();

