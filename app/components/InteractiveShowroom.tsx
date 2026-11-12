"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type RoomKind = "living" | "bedroom" | "hospitality";

type Finish = "plaster" | "walnut" | "stone" | "fabric" | "timber" | "concrete";
const finishTextureCache = new Map<Finish, THREE.DataTexture>();

function makeFinishTexture(finish: Finish) {
  const cached = finishTextureCache.get(finish);
  if (cached) return cached;
  // Reuse one small procedural texture per finish instead of allocating a new texture for every object.
  const width = 128, height = 128;
  const data = new Uint8Array(width * height * 4);
  const palettes: Record<Finish, [number, number, number]> = {
    plaster: [119, 123, 93], walnut: [91, 59, 37], stone: [199, 188, 169],
    fabric: [220, 211, 195], timber: [132, 99, 66], concrete: [173, 168, 158]
  };
  const [r, g, b] = palettes[finish];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const grain = Math.sin(x * 0.31 + Math.sin(y * 0.08) * 2.2) * 5
        + Math.sin(y * 0.17 + x * 0.025) * 2
        + Math.sin((x + y) * 0.73) * 1.8;
      const vein = finish === "stone" ? Math.sin(x * 0.11 + Math.sin(y * 0.045) * 8) * 9 : 0;
      const noise = Math.sin(x * 12.9898 + y * 78.233) * 2;
      const offset = (y * width + x) * 4;
      data[offset] = Math.max(0, Math.min(255, r + grain + vein + noise));
      data[offset + 1] = Math.max(0, Math.min(255, g + grain + vein + noise));
      data[offset + 2] = Math.max(0, Math.min(255, b + grain + vein + noise));
      data[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  finishTextureCache.set(finish, texture);
  return texture;
}
function Box({ position, size, color, roughness = 0.75, metalness = 0, castShadow = true, finish, emissive }: {
  position: [number, number, number]; size: [number, number, number]; color: string;
  roughness?: number; metalness?: number; castShadow?: boolean; finish?: Finish; emissive?: string;
}) {
  const map = useMemo(() => finish ? makeFinishTexture(finish) : undefined, [finish]);
  return <mesh position={position} castShadow={castShadow} receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={finish === "fabric" ? 0.035 : finish === "stone" ? 0.022 : 0.012} roughness={roughness} metalness={metalness} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 1.35 : 0} />
  </mesh>;
}

function RoomShell({ wall = "#687052", floor = "#b5a38b" }: { wall?: string; floor?: string }) {
  return <group>
    <Box position={[0, -0.09, 0]} size={[9, 0.18, 8]} color={floor} roughness={0.92} finish="stone" />
    <Box position={[0, 1.82, -3.94]} size={[9, 3.64, 0.14]} color={wall} roughness={0.94} finish="plaster" />
    <Box position={[-4.44, 1.82, 0]} size={[0.14, 3.64, 8]} color={wall} roughness={0.94} />
    <Box position={[4.44, 1.82, -3.1]} size={[0.14, 3.64, 1.7]} color={wall} roughness={0.94} />
    {/* Architectural ceiling: a deep cutaway canopy with layered cove and recessed lighting. */}
    <group>
      <Box position={[0, 3.68, -2.05]} size={[8.8, 0.16, 3.75]} color="#e5e0d6" roughness={0.86} />
      <Box position={[0, 3.575, -2.05]} size={[6.7, 0.035, 2.75]} color="#d2cbbd" roughness={0.9} />
      {/* stepped perimeter bulkhead */}
      <Box position={[0, 3.49, -0.28]} size={[8.8, 0.22, 0.16]} color="#c9c0b1" />
      <Box position={[-4.28, 3.49, -2.05]} size={[0.18, 0.22, 3.55]} color="#c9c0b1" />
      <Box position={[4.28, 3.49, -2.05]} size={[0.18, 0.22, 3.55]} color="#c9c0b1" />
      {/* warm recessed cove-light channels */}
      <Box position={[-3.78, 3.585, -2.05]} size={[0.035, 0.018, 3.15]} color="#fff0d2" emissive="#ffe0a6" />
      <Box position={[3.78, 3.585, -2.05]} size={[0.035, 0.018, 3.15]} color="#fff0d2" emissive="#ffe0a6" />
      <Box position={[0, 3.585, -3.72]} size={[7.55, 0.018, 0.035]} color="#fff0d2" emissive="#ffe0a6" />
      <Box position={[0, 3.585, -0.38]} size={[7.55, 0.018, 0.035]} color="#fff0d2" emissive="#ffe0a6" />
      {/* three clean linear LED slots */}
      {[-1.15, 0, 1.15].map((x) => <Box key={x} position={[x, 3.59, -2.05]} size={[0.045, 0.02, 2.9]} color="#fff7e8" emissive="#fff0d0" />)}
      {/* recessed downlights */}
      {[[-3.05, -3.05], [-1.55, -3.05], [0, -3.05], [1.55, -3.05], [3.05, -3.05], [-3.05, -1.05], [3.05, -1.05]].map(([x,z], i) => (
        <group key={i} position={[x, 3.585, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.025, 24]} />
            <meshStandardMaterial color="#f8f3e8" emissive="#fff0d2" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
    <Box position={[0, 0.025, -3.82]} size={[8.7, 0.045, 0.045]} color="#9b8062" />
  </group>;
}

function Plant({ position }: { position: [number, number, number] }) {
  return <group position={position}>
    <mesh position={[0, 0.32, 0]} castShadow><cylinderGeometry args={[0.25, 0.3, 0.62, 24]} /><meshStandardMaterial color="#302a22" roughness={0.45} /></mesh>
    {Array.from({ length: 9 }).map((_, i) => <mesh key={i}
      position={[Math.sin(i * 0.82) * 0.22, 0.95 + (i % 3) * 0.13, Math.cos(i * 0.82) * 0.2]}
      rotation={[0.25, i * 0.7, Math.sin(i) * 0.3]} castShadow>
      <capsuleGeometry args={[0.075, 0.72, 5, 8]} />
      <meshStandardMaterial color={i % 2 ? "#43543d" : "#71805a"} roughness={0.88} />
    </mesh>)}
  </group>;
}

function Curtains({ x = -4.22, z = -1.4, width = 3.4 }: { x?: number; z?: number; width?: number }) {
  return <group position={[x, 0, z]}>
    <Box position={[0, 3.15, 0]} size={[0.055, 0.055, width + 0.2]} color="#8e795e" metalness={0.45} />
    {Array.from({ length: 13 }).map((_, i) => <mesh key={i}
      position={[0.04, 1.72, -width / 2 + i * (width / 12)]} castShadow>
      <boxGeometry args={[0.13, 3.05, 0.22]} />
      <meshStandardMaterial color={i % 2 ? "#b9a98f" : "#d0c2aa"} roughness={1} />
    </mesh>)}
  </group>;
}

function Pendant({ position, shade = "#25251f" }: { position: [number, number, number]; shade?: string }) {
  return <group position={position}>
    <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.012, 0.012, 1.35, 8]} /><meshStandardMaterial color="#26241f" metalness={0.7} /></mesh>
    <mesh position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.12, 0.29, 0.34, 32, 1, true]} /><meshStandardMaterial color={shade} metalness={0.5} roughness={0.35} side={2} /></mesh>
    <pointLight position={[0, -0.12, 0]} intensity={0.32} distance={3} color="#ffdb9e" />
  </group>;
}

function LivingRoom() {
  return <group>
    <RoomShell wall="#626b49" floor="#b6a48e" />
    {/* Walnut TV feature wall and floating console */}
    <Box position={[0.35, 1.72, -3.82]} size={[3.8, 2.75, 0.12]} color="#60442f" finish="walnut" />
    {Array.from({ length: 17 }).map((_, i) => <Box key={i} position={[-1.35 + i * 0.21, 1.72, -3.73]} size={[0.035, 2.62, 0.035]} color="#8b6848" />)}
    <Box position={[0.35, 1.95, -3.65]} size={[1.75, 1.02, 0.08]} color="#171916" roughness={0.22} />
    <Box position={[0.35, 0.48, -3.55]} size={[3.35, 0.3, 0.48]} color="#765438" finish="walnut" />
    <Box position={[0.35, 0.64, -3.55]} size={[3.35, 0.035, 0.49]} color="#a27c55" />
    {/* Low modular cream sofa */}
    <Box position={[-0.65, 0.43, -0.75]} size={[3.5, 0.55, 1.05]} color="#d7cbbb" roughness={0.98} finish="fabric" />
    <Box position={[-0.65, 0.86, -1.18]} size={[3.5, 0.9, 0.28]} color="#cbbda9" roughness={1} finish="fabric" />
    {[-1.8, -0.65, 0.5].map((x) => <Box key={x} position={[x, 0.94, -0.68]} size={[1.03, 0.55, 0.78]} color="#e5ded1" roughness={1} />)}
    <Box position={[-0.5, 0.2, 0.65]} size={[2.7, 0.08, 1.35]} color="#72543b" />
    <Box position={[-0.5, 0.27, 0.65]} size={[2.85, 0.035, 1.48]} color="#b9a88f" roughness={0.42} />
    <Box position={[-0.5, 0.055, 0.65]} size={[2.45, 0.06, 1.18]} color="#4a3526" />
    {/* Layered rug, curtains and lighting */}
    <Box position={[-0.65, 0.025, 0.45]} size={[4.4, 0.035, 3.2]} color="#c4b59f" roughness={1} castShadow={false} />
    <Curtains x={-4.22} z={-1.05} width={4.6} />
    {[-1.7, 0, 1.7].map((x) => <Pendant key={x} position={[x, 2.72, -0.5]} />)}
    <Box position={[-2.8, 1.8, -3.78]} size={[0.8, 1.15, 0.08]} color="#b69a76" />
    <Plant position={[3.45, 0, -2.65]} />
    <Box position={[3.1, 0.32, 0.3]} size={[0.65, 0.64, 0.65]} color="#5b4632" />
  </group>;
}

function Bedroom() {
  return <group>
    <RoomShell wall="#b5a895" floor="#9b8064" />
    {/* Upholstered headboard, bed and layered bedding */}
    <Box position={[0, 1.48, -3.78]} size={[4.2, 2.1, 0.2]} color="#796653" />
    {[-1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75].map((x) => <Box key={x} position={[x, 1.5, -3.65]} size={[0.025, 1.75, 0.035]} color="#a18a70" />)}
    <Box position={[0, 0.43, -1.72]} size={[3.5, 0.72, 2.55]} color="#62452f" />
    <Box position={[0, 0.83, -1.55]} size={[3.45, 0.24, 2.38]} color="#e6dfd4" roughness={1} finish="fabric" />
    <Box position={[0, 0.99, -2.28]} size={[3.35, 0.12, 0.92]} color="#c9bda9" roughness={1} />
    {[-0.92, 0.92].map((x) => <group key={x}>
      <Box position={[x, 1.1, -2.42]} size={[0.95, 0.22, 0.62]} color="#f0eade" roughness={1} />
      <Box position={[x, 0.36, -0.35]} size={[0.78, 0.65, 0.72]} color="#76583e" finish="walnut" />
      <Box position={[x, 0.7, -0.35]} size={[0.82, 0.045, 0.75]} color="#b39a78" />
    </group>)}
    <Box position={[0, 0.025, 0.1]} size={[5.2, 0.035, 4.2]} color="#c8bca9" roughness={1} castShadow={false} />
    {/* Wardrobe with contrasting dark reveals */}
    <Box position={[3.35, 1.55, -2.55]} size={[1.65, 3.05, 2.25]} color="#76583e" />
    {[-0.48, 0.48].map((x) => <Box key={x} position={[3.35 + x, 1.55, -1.39]} size={[0.82, 2.85, 0.035]} color="#b39a78" roughness={0.45} />)}
    <Box position={[3.35, 1.55, -1.34]} size={[0.035, 2.9, 0.045]} color="#3d3026" />
    <Curtains x={-4.22} z={-1.5} width={3.8} />
    <Pendant position={[-1.8, 2.72, -0.1]} shade="#b18e62" />
    <Pendant position={[1.8, 2.72, -0.1]} shade="#b18e62" />
    <Plant position={[-3.45, 0, -2.7]} />
    <Box position={[0, 2.85, -3.72]} size={[3.4, 0.035, 0.035]} color="#d6b77e" emissive="#d6b77e" />
  </group>;
}

function Hospitality() {
  return <group>
    <RoomShell wall="#353b32" floor="#806b54" />
    {/* Backlit stone-effect bar wall */}
    <Box position={[0, 1.65, -3.78]} size={[5.7, 2.8, 0.18]} color="#a88c68" roughness={0.55} finish="stone" />
    <Box position={[0, 1.65, -3.65]} size={[5.45, 2.55, 0.06]} color="#554638" roughness={0.62} />
    {[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((x) => <Box key={x} position={[x, 1.65, -3.59]} size={[0.018, 2.4, 0.025]} color="#bd9a68" emissive="#8d6b42" />)}
    <Box position={[0, 1.2, -2.85]} size={[5.1, 1.05, 0.85]} color="#4b3829" />
    <Box position={[0, 1.76, -2.83]} size={[5.2, 0.09, 0.95]} color="#c0a078" roughness={0.3} />
    <Box position={[0, 0.62, -1.25]} size={[4.8, 0.9, 1.0]} color="#382b22" />
    <Box position={[0, 1.12, -1.25]} size={[4.9, 0.12, 1.08]} color="#b18d5e" roughness={0.3} metalness={0.18} finish="stone" />
    {/* Lounge seating and cocktail tables */}
    {[-1.45, 0, 1.45].map((x) => <group key={x} position={[x, 0, 0.55]}>
      <Box position={[0, 0.43, 0]} size={[1.08, 0.18, 0.92]} color="#b9a58d" />
      <Box position={[0, 0.88, -0.35]} size={[1.08, 0.85, 0.18]} color="#8f775e" />
      <Box position={[0, 0.2, 0]} size={[0.08, 0.4, 0.08]} color="#392c22" />
    </group>)}
    <Box position={[0, 0.18, 1.9]} size={[1.6, 0.12, 0.85]} color="#4c3828" />
    <Box position={[0, 0.26, 1.9]} size={[1.65, 0.035, 0.9]} color="#b69a72" roughness={0.28} />
    <Plant position={[3.55, 0, -2.7]} />
    {[-2, 0, 2].map((x) => <Pendant key={x} position={[x, 2.75, -1.5]} shade="#25231e" />)}
    <Box position={[-3.75, 1.65, -3.66]} size={[0.035, 2.3, 0.035]} color="#d6b77e" emissive="#9d7849" />
    <Box position={[3.75, 1.65, -3.66]} size={[0.035, 2.3, 0.035]} color="#d6b77e" emissive="#9d7849" />
  </group>;
}

function ShowroomScene({ room }: { room: RoomKind }) {
  const [idle, setIdle] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);
  const handleInteractionStart = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setIdle(false);
  };
  const handleInteractionEnd = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 4500);
  };
  return <>
    <color attach="background" args={["#d6d0c5"]} />
    <ambientLight intensity={0.48} />
    <hemisphereLight args={["#fff5e7", "#655746", 0.72]} />
    <directionalLight position={[4, 8, 6]} intensity={1.65} color="#fff0d9" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-0.00015} />
    <directionalLight position={[-5, 4, 2]} intensity={0.48} color="#d8e0e8" />
    <pointLight position={[-2, 2.8, -2]} intensity={0.52} distance={8} color="#f5d5a5" />
    {room === "living" ? <LivingRoom /> : room === "bedroom" ? <Bedroom /> : <Hospitality />}
    <ContactShadows position={[0, 0.015, 0]} opacity={0.26} scale={13} blur={3.2} far={5} />
    <OrbitControls makeDefault target={[0, 1.25, -0.55]} minDistance={7} maxDistance={13} minPolarAngle={0.35} maxPolarAngle={1.45} minAzimuthAngle={-1.43} maxAzimuthAngle={2.78} enablePan={false} enableDamping dampingFactor={0.08} autoRotate={idle} autoRotateSpeed={0.12} onStart={handleInteractionStart} onEnd={handleInteractionEnd} />
  </>;
}

export default function InteractiveShowroom() {
  const [room, setRoom] = useState<RoomKind>("living");
  const rooms: { id: RoomKind; label: string; number: string; description: string }[] = [
    { id: "living", label: "Living & kitchen", number: "01", description: "Olive-toned walls, walnut detailing, tailored upholstery and layered architectural lighting." },
    { id: "bedroom", label: "Bedroom suite", number: "02", description: "An upholstered feature wall, warm timber wardrobe, layered bedding and soft ambient lighting." },
    { id: "hospitality", label: "Hospitality lounge", number: "03", description: "A sculpted bar, warm stone and timber finishes, intimate seating and atmospheric pendants." }
  ];
  const active = rooms.find((item) => item.id === room)!;
  return <section className="showroom-section" id="showroom">
    <div className="showroom-heading">
      <div><p className="eyebrow">STEP INSIDE MEETOO</p><h2>Explore the <em>showroom.</em></h2></div>
      <p className="showroom-instruction">Drag to look around. Scroll to move closer.</p>
    </div>
    <div className="showroom-frame">
      <div className="showroom-canvas">
        <Suspense fallback={<div className="showroom-loading">Preparing the space…</div>}>
          <Canvas shadows camera={{ position: [9.2, 3.15, 11.5], fov: 43 }} dpr={[1, 1.35]} gl={{ antialias: true, powerPreference: "high-performance" }}>
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
        <p className="showroom-hint">Use your mouse or touch to orbit the room. Each space has its own material palette and interior scheme.</p>
      </div>
    </div>
  </section>;
}
