import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsType } from "three-stdlib"; // 导入 OrbitControls 类型

import "./App.css";

const App: React.FC = () => {
  useEffect(() => {
   
  }, []);


  return (
    <div className="app">
      {/* 3D 场景 */}
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />
      </Canvas>

      {/* UI 控件 */}
      <div
        className="interactive"
        style={{
          position: "absolute",
          top: 120,
          left: 120,
          color: "blue",
          pointerEvents: "auto",
        }}
      >
        
      </div>
    </div>
  );
};

export default App;
