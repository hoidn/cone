import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const generateSpiralPoints = (count, turns, radius, height) => {
  const points = [];
  const tangents = [];
  const quaternions = [];
  
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
    const pos = getPosition(t);
    const dt = 0.001;
    const nextPos = getPosition(t + dt);
    const tangent = nextPos.sub(pos).normalize();
    
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    quaternion.setFromUnitVectors(up, tangent);
    
    points.push([pos.x, pos.y, pos.z]);
    tangents.push([tangent.x, tangent.y, tangent.z]);
    quaternions.push([quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
  }
  
  return { points, tangents, quaternions };
};

const SmallCone = ({ position, quaternion, scale = 0.1 }) => {
  // Geometry constants
  const coneLength = 2.5;
  const coneRadius = 1.0;
  const protrusion = coneLength * 0.2;  // 1/5 beyond cone tip
  const arrowLength = coneLength + protrusion;
  const arrowRadius = coneRadius * 0.15;  // Thin arrow relative to cone base
  const arrowHeadLength = arrowRadius * 4;  // Proportional head size
  
  // Position calculations
  // Since Three.js centers geometries:
  // - Cone base at y=0, tip at y=coneLength
  // - Arrow should extend from y=0 to y=(coneLength + protrusion)
  const arrowShaftLength = arrowLength - arrowHeadLength;
  const arrowShaftCenter = arrowShaftLength / 2;
  const arrowHeadPosition = arrowShaftLength;
  
  console.log('Geometry:', {
    coneLength,
    protrusion,
    arrowLength,
    arrowShaftLength,
    arrowShaftCenter,
    arrowHeadPosition
  });

  return (
    <group position={position}>
      {/* Red cone */}
      <mesh 
        scale={scale}
        quaternion={quaternion}
      >
        <coneGeometry args={[coneRadius, coneLength, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      {/* Blue arrow */}
      <group 
        quaternion={quaternion}
        scale={scale}
      >
        {/* Arrow shaft */}
        <mesh position={[0, arrowShaftCenter, 0]}>
          <cylinderGeometry args={[arrowRadius, arrowRadius, arrowShaftLength, 8]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        
        {/* Arrow head */}
        <mesh position={[0, arrowHeadPosition, 0]}>
          <coneGeometry args={[arrowRadius * 2, arrowHeadLength, 8]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>
    </group>
  );
};

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
