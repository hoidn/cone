import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const generateSpiralPoints = (count, turns, radius, height) => {
  console.log('Generating points with:', { count, turns, radius, height });
  
  const points = [];
  const quaternions = [];
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = turns * 2 * Math.PI * t;
    
    // Position on cone surface
    const currentRadius = radius * (1 - t);
    const x = currentRadius * Math.cos(angle);
    const z = currentRadius * Math.sin(angle);
    const y = height * t;
    
    // Calculate direction vector from cone center to point
    const centerToPoint = new THREE.Vector3(x, y - height/2, z);
    centerToPoint.normalize();
    
    // Create quaternion to rotate from default orientation (0,1,0) to surface normal
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    quaternion.setFromUnitVectors(up, centerToPoint);
    
    points.push([x, y, z]);
    quaternions.push([quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
    
    // Log every 10th point for debugging
    if (i % 10 === 0) {
      console.log(`Point ${i}:`, {
        position: [x, y, z],
        quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w]
      });
    }
  }
  
  return { points, quaternions };
};

const SmallCone = ({ position, quaternion, scale = 0.1 }) => (
  <group position={position}>
    <mesh 
      scale={scale}
      quaternion={quaternion}
    >
      <coneGeometry args={[1, 2, 8]} />
      <meshStandardMaterial color="red" />
    </mesh>
  </group>
);

const MainCone = ({ height = 10, radius = 5 }) => (
  <mesh position={[0, height/2, 0]}>  {/* Center the cone vertically */}
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
          scale={mainConeRadius * 0.08}
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
