"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense, useState } from "react";
import * as THREE from "three";

type RoomKind = "living" | "bedroom" | "hospitality";

function RoomShell() {
  return (
    <group>
      {/* Open-front architectural cutaway: the camera can see the whole room. */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[9, 0.16, 8]} />
        <meshStandardMaterial color="#8a7864" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.82, -3.94]} receiveShadow castShadow>
        <boxGeometry args={[9, 3.64, 0.12]} />
        <meshStandardMaterial color="#e8dfd0" roughness={0.92} />
      </mesh>
      <mesh position={[-4.44, 1.82, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.12, 3.64, 8]} />
        <meshStandardMaterial color="#d9cdbb" roughness={0.92} />
      </mesh>
      {/* Short return wall gives the model depth without hiding the furniture. */}
      <mesh position={[4.44, 1.82, -3.05]} receiveShadow castShadow>
        <boxGeometry args={[0.12, 3.64, 1.78]} />
        <meshStandardMaterial color="#d9cdbb" roughness={0.92} />
      </mesh>
      <mesh position={[0, 3.68, -3.86]} receiveShadow>
        <boxGeometry args={[8.72, 0.08, 0.08]} />
        <meshStandardMaterial color="#b7a58e" roughness={0.75} />
      </mesh>
      <mesh position={[-4.34, 1.82, 0]} receiveShadow>
        <boxGeometry args={[0.08, 3.64, 7.82]} />
        <meshStandardMaterial color="#d9cdbb" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.015, -3.84]}>
        <boxGeometry args={[8.7, 0.035, 0.035]} />
        <meshStandardMaterial color="#9c876e" />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.55, 24]} />
        <meshStandardMaterial color="#8a7660" roughness={0.8} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.9) * 0.2, 0.85 + (i % 3) * 0.12, Math.cos(i * 0.9) * 0.18]} rotation={[0.3, i, Math.sin(i) * 0.35]} castShadow>
          <capsuleGeometry args={[0.075, 0.65, 5, 8]} />
          <meshStandardMaterial color={i % 2 ? "#59684f" : "#788268"} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function LivingRoom() {
  return (
    <group>
      <mesh position={[-0.8, 0.55, -1.25]} castShadow>
        <boxGeometry args={[3.1, 0.75, 1.15]} />
        <meshStandardMaterial color="#b7a48e" roughness={0.95} />
      </mesh>
      <mesh position={[-0.8, 0.98, -1.25]} castShadow>
        <boxGeometry args={[3.1, 0.18, 1.15]} />
        <meshStandardMaterial color="#c9b8a2" roughness={0.95} />
      </mesh>
      <mesh position={[-2.25, 1.05, -1.25]} castShadow>
        <boxGeometry args={[0.22, 1.15, 1.18]} />
        <meshStandardMaterial color="#9f8c77" />
      </mesh>
      <mesh position={[0.65, 0.72, -1.25]} castShadow>
        <boxGeometry args={[0.18, 0.95, 1.18]} />
        <meshStandardMaterial color="#9f8c77" />
      </mesh>
      <mesh position={[0.15, 0.35, 0.35]} castShadow>
        <boxGeometry args={[2.2, 0.12, 1.15]} />
        <meshStandardMaterial color="#765b43" roughness={0.55} />
      </mesh>
      <mesh position={[0.15, 0.58, 0.35]} castShadow>
        <boxGeometry args={[0.95, 0.32, 0.65]} />
        <meshStandardMaterial color="#e5ded2" roughness={0.4} />
      </mesh>
      <mesh position={[0.15, 0.09, 0.35]}>
        <boxGeometry args={[2.35, 0.04, 1.3]} />
        <meshStandardMaterial color="#b6a38d" />
      </mesh>
      <mesh position={[-1.5, 0.04, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 2.5]} />
        <meshStandardMaterial color="#b8aa96" roughness={1} />
      </mesh>
      <Plant position={[3.25, 0, -2.5]} />
      <mesh position={[-3.1, 1.35, -3.82]}>
        <boxGeometry args={[1.45, 1.1, 0.08]} />
        <meshStandardMaterial color="#6d5744" />
      </mesh>
      <mesh position={[-3.1, 1.35, -3.75]}>
        <boxGeometry args={[1.27, 0.92, 0.04]} />
        <meshStandardMaterial color="#c5b7a3" />
      </mesh>
    </group>
  );
}

function Bedroom() {
  return (
    <group>
      <mesh position={[0.2, 0.42, -1.45]} castShadow>
        <boxGeometry args={[3.25, 0.72, 2.35]} />
        <meshStandardMaterial color="#765b45" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.86, -1.3]} castShadow>
        <boxGeometry args={[3.1, 0.22, 2.15]} />
        <meshStandardMaterial color="#e5dfd4" roughness={1} />
      </mesh>
      <mesh position={[0.2, 1.12, -2.45]} castShadow>
        <boxGeometry args={[3.3, 1.2, 0.16]} />
        <meshStandardMaterial color="#a78f76" roughness={0.9} />
      </mesh>
      {[-0.65, 0.75].map((x) => <mesh key={x} position={[x, 1.02, -1.95]} rotation={[-0.15, 0, 0]} castShadow><boxGeometry args={[1.05, 0.28, 0.72]} /><meshStandardMaterial color="#f4eee4" /></mesh>)}
      <mesh position={[-2.2, 0.35, -1.25]} castShadow><boxGeometry args={[0.72, 0.7, 0.72]} /><meshStandardMaterial color="#80664f" /></mesh>
      <mesh position={[2.4, 0.35, -1.25]} castShadow><boxGeometry args={[0.72, 0.7, 0.72]} /><meshStandardMaterial color="#80664f" /></mesh>
      <mesh position={[0.2, 0.04, 0.25]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4.8, 3.5]} /><meshStandardMaterial color="#bcae9c" /></mesh>
      <Plant position={[3.35, 0, -2.7]} />
    </group>
  );
}

function Hospitality() {
  return (
    <group>
      <mesh position={[0, 0.58, -1.6]} castShadow><boxGeometry args={[4.3, 0.9, 0.9]} /><meshStandardMaterial color="#594638" roughness={0.7} /></mesh>
      <mesh position={[0, 1.08, -1.6]} castShadow><boxGeometry args={[4.35, 0.12, 0.94]} /><meshStandardMaterial color="#a98962" metalness={0.2} roughness={0.35} /></mesh>
      {[-1.4, 0, 1.4].map((x) => <group key={x} position={[x, 0, 0.35]}><mesh position={[0, 0.65, 0]} castShadow><cylinderGeometry args={[0.34, 0.34, 0.12, 24]} /><meshStandardMaterial color="#9b8060" /></mesh><mesh position={[0, 0.34, 0]}><cylinderGeometry args={[0.045, 0.045, 0.58, 12]} /><meshStandardMaterial color="#594b3c" /></mesh><mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.3, 0.3, 0.08, 20]} /><meshStandardMaterial color="#594b3c" /></mesh></group>)}
      <mesh position={[0, 0.04, 0.4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5.5, 3.4]} /><meshStandardMaterial color="#887661" /></mesh>
      <Plant position={[3.25, 0, -2.65]} />
      <mesh position={[-2.3, 1.8, -3.82]}><boxGeometry args={[1.7, 0.08, 0.08]} /><meshStandardMaterial color="#c69a61" emissive="#8a5e2b" emissiveIntensity={0.35} /></mesh>
      <mesh position={[2.2, 1.8, -3.82]}><boxGeometry args={[1.7, 0.08, 0.08]} /><meshStandardMaterial color="#c69a61" emissive="#8a5e2b" emissiveIntensity={0.35} /></mesh>
    </group>
  );
}

function ShowroomScene({ room }: { room: RoomKind }) {
  return (
    <>
      <color attach="background" args={["#d8d0c3"]} />
      <fog attach="fog" args={["#d8d0c3", 9, 18]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 7, 5]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-2, 3, -2]} intensity={0.8} color="#f3d7ad" />
      <RoomShell />
      {room === "living" ? <LivingRoom /> : room === "bedroom" ? <Bedroom /> : <Hospitality />}
      <ContactShadows position={[0, 0.015, 0]} opacity={0.35} scale={12} blur={2.5} far={5} />
      <OrbitControls makeDefault target={[0, 1.05, -0.35]} minDistance={7} maxDistance={13} minPolarAngle={0.68} maxPolarAngle={1.35} enablePan={false} autoRotate autoRotateSpeed={0.32} />
    </>
  );
}

export default function InteractiveShowroom() {
  const [room, setRoom] = useState<RoomKind>("living");
  const rooms: { id: RoomKind; label: string; number: string; description: string }[] = [
    { id: "living", label: "Living space", number: "01", description: "A warm, relaxed living space shaped by proportion, texture and natural light." },
    { id: "bedroom", label: "Private retreat", number: "02", description: "A calm bedroom composition with tactile layers and a restrained material palette." },
    { id: "hospitality", label: "Hospitality", number: "03", description: "An intimate hospitality setting designed around atmosphere and connection." }
  ];
  const active = rooms.find((item) => item.id === room)!;

  return (
    <section className="showroom-section" id="showroom">
      <div className="showroom-heading">
        <div><p className="eyebrow">STEP INSIDE MEETOO</p><h2>Explore the <em>showroom.</em></h2></div>
        <p className="showroom-instruction">Drag to look around. Scroll to move closer.</p>
      </div>
      <div className="showroom-frame">
        <div className="showroom-canvas">
          <Suspense fallback={<div className="showroom-loading">Preparing the space…</div>}>
            <Canvas shadows camera={{ position: [9.2, 6.4, 11.5], fov: 43 }} dpr={[1, 1.7]}>
              <ShowroomScene room={room} />
            </Canvas>
          </Suspense>
          <div className="showroom-canvas-label"><span>MEETOO / SPATIAL STUDIES</span><span>INTERACTIVE 3D</span></div>
        </div>
        <div className="showroom-controls">
          <div className="room-tabs" role="tablist" aria-label="Choose a showroom">
            {rooms.map((item) => <button key={item.id} className={room === item.id ? "room-tab active" : "room-tab"} onClick={() => setRoom(item.id)} role="tab" aria-selected={room === item.id}><span>{item.number}</span>{item.label}</button>)}
          </div>
          <div className="room-description"><p className="eyebrow">NOW EXPLORING · {active.number}</p><p>{active.description}</p></div>
          <p className="showroom-hint">Use your mouse or touch to orbit the room. The scene adjusts to your screen.</p>
        </div>
      </div>
    </section>
  );
}
