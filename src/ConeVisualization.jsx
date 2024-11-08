import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const generateSpiralPoints = (count, turns, radius, height) => {
  const points = [];
  const tangents = [];
  const quaternions = [];
  
  // Helper to get position at any t
  const getPosition = (t) => {
    const angle = turns * 2 * Math.PI * t;
    const currentRadius = radius * (1 - t);
    return new THREE.Vector3(
      currentRadius * Math.cos(angle),
      height * t,
      currentRadius * Math.sin(angle)
    );
  };
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    
    // Get current position
    const pos = getPosition(t);
    
    // Get tangent by computing a nearby point and subtracting
    const dt = 0.001;  // Small delta for numerical derivative
    const nextPos = getPosition(t + dt);
    const tangent = nextPos.sub(pos).normalize();
    
    // Create quaternion for rotation
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    quaternion.setFromUnitVectors(up, tangent);
    
    points.push([pos.x, pos.y, pos.z]);
    tangents.push([tangent.x, tangent.y, tangent.z]);
    quaternions.push([quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
    
    if (i % 10 === 0) {
      console.log(`Point ${i}:`, {
        t,
        position: [pos.x, pos.y, pos.z],
        tangent: [tangent.x, tangent.y, tangent.z]
      });
    }
  }
  
  return { points, tangents, quaternions };
};

const SmallCone = ({ position, quaternion, scale = 0.1 }) => (
  <group position={position}>
    <mesh 
      scale={scale}
      quaternion={quaternion}
    >
      <coneGeometry args={[1, 2.5, 16]} />
      <meshStandardMaterial color="red" />
    </mesh>
  </group>
);

const MainCone = ({ height = 10, radius = 5 }) => (
  <mesh position={[0, height/2, 0]}>
    <coneGeometry args={[radius, height, 32]} />
    <meshStandardMaterial color="gray" transparent opacity={0.7} />
  </mesh>
);

const Scene = () => {
  const mainConeHeight = 10;
  const mainConeRadius = 5;
  const smallConesCount = 50;
  const spiralTurns = 3;

  const { points, quaternions } = generateSpiralPoints(
    smallConesCount,
    spiralTurns,
    mainConeRadius,
    mainConeHeight
  );

  return (
    <group>
      <MainCone height={mainConeHeight} radius={mainConeRadius} />
      {points.map((pos, idx) => (
        <SmallCone 
          key={idx} 
          position={pos}
          quaternion={quaternions[idx]}
          scale={mainConeRadius * 0.04}
        />
      ))}
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      <PerspectiveCamera
        makeDefault
        position={[15, 15, 15]}
        fov={45}
      />
      <OrbitControls />
    </group>
  );
};

const ConeVisualization = () => {
  return (
    <div className="h-screen w-full">
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
};

export default ConeVisualization;
