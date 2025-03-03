// === File: main.ts ===

import { ThreejsSceneTest } from './ThreejsSceneTest';

// 初始化场景测试
const sceneTest = new ThreejsSceneTest();

// 启动动画循环
sceneTest.animate();

// 监听窗口大小变化
window.addEventListener('resize', () => sceneTest.handleResize());

// 监听全屏状态变化
document.addEventListener('fullscreenchange', () => sceneTest.handleResize());

// 移除启动提示
document.getElementById('start-message')?.remove();