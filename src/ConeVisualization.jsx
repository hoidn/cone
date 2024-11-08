import React from 'react';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

// Utility function to calculate spiral points
const generateSpiralPoints = (count, turns, radius, height) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = turns * 2 * Math.PI * t;
    const r = radius * (1 - t * 0.5); // Spiral gets slightly tighter at top
    const x = r * Math.cos(angle);
    const z = r * Math.sin(angle);
    const y = height * t;
    points.push([x, y, z]);
  }
  return points;
};

// Small cone with arrow
const SmallConeWithArrow = ({ position, scale = 0.1 }) => (
  <group position={position}>
    <mesh scale={scale}>
      <coneGeometry args={[1, 2, 8]} />
      <meshStandardMaterial color="red" />
    </mesh>
    <mesh position={[0, scale * 2, 0]} scale={[scale * 0.2, scale * 1, scale * 0.2]}>
      <cylinderGeometry args={[0.2, 0.2, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  </group>
);

// Main cone component
const MainCone = ({ height = 10, radius = 5 }) => (
  <mesh>
    <coneGeometry args={[radius, height, 32]} />
    <meshStandardMaterial color="gray" transparent opacity={0.7} />
  </mesh>
);

// Scene component with all elements
const Scene = () => {
  const mainConeHeight = 10;
  const mainConeRadius = 5;
  const smallConesCount = 50;
  const spiralTurns = 3;

  const smallConePositions = generateSpiralPoints(
    smallConesCount,
    spiralTurns,
    mainConeRadius * 0.8,
    mainConeHeight * 0.8
  );

  return (
    <group>
      <MainCone height={mainConeHeight} radius={mainConeRadius} />
      {smallConePositions.map((pos, idx) => (
        <SmallConeWithArrow key={idx} position={pos} />
      ))}
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[15, 15, 15]}
        fov={45}
      />
      <OrbitControls />
    </group>
  );
};

// Main component
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
