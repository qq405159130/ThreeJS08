import React, { useRef, useEffect } from "react";

const FullScreenButton = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理全屏状态变化
  const handleFullScreenChange = () => {
    if (document.fullscreenElement) {
      console.log("进入全屏");
      // 在这里可以调整Three.js场景的尺寸
      
    } else {
      console.log("退出全屏");
      // 在这里可以调整Three.js场景的尺寸
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    // 在组件卸载时移除监听器
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const enterFullScreen = () => {
    const container = document.getElementById('container'); // 进入全屏的目标容器
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).mozRequestFullScreen) { // Firefox
        (container as any).mozRequestFullScreen();
      } else if ((container as any).webkitRequestFullscreen) { // Chrome, Safari, Opera
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) { // IE/Edge
        (container as any).msRequestFullscreen();
      }
    }
  };
  
  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) { // Firefox
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) { // Chrome, Safari, Opera
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) { // IE/Edge
      (document as any).msExitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fullscreen-button-container"
      style={{
        position: "absolute",
        top: 120,
        left: "50%",
        color: "white",
        pointerEvents: "auto",
      }}
    >
      <button style={{ width: "120px", height: "40px" }} onClick={enterFullScreen}>进入全屏</button>
      <button style={{ width: "120px", height: "40px" }} onClick={exitFullScreen}>退出全屏</button>
    </div>
    //   <div ref={containerRef} className="fullscreen-button-container">
    //     <button onClick={enterFullScreen}>进入全屏</button>
    //     <button onClick={exitFullScreen}>退出全屏</button>
    // </div>
  );
};

export default FullScreenButton;
