import { ThreejsSceneTest } from './ThreejsSceneEntry';

// 确保页面加载完成后再初始化 Three.js 场景
window.onload = () => {
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
};