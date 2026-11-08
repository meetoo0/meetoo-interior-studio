"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";

type RoomKind = "living" | "bedroom" | "hospitality";

type Finish = "plaster" | "walnut" | "stone" | "fabric" | "timber" | "concrete";
function makeFinishTexture(finish: Finish) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const palettes: Record<Finish, [string, string]> = {
    plaster: ["#777b5d", "#929477"], walnut: ["#4a3020", "#986a43"],
    stone: ["#d5cbb9", "#a99d8b"], fabric: ["#d6cbbb", "#eee8dc"],
    timber: ["#76543a", "#b18a60"], concrete: ["#a7a197", "#c2bdb3"]
  };
  const [base, detail] = palettes[finish];
  ctx.fillStyle = base; ctx.fillRect(0,0,512,512);
  if (finish === "walnut" || finish === "timber") {
    for (let i=0;i<95;i++) {
      const y=Math.random()*512, h=1+Math.random()*5;
      ctx.globalAlpha=0.12+Math.random()*0.2; ctx.fillStyle=detail;
      ctx.fillRect(0,y,512,h);
    }
    for(let i=0;i<18;i++){ctx.globalAlpha=.12;ctx.strokeStyle="#24180f";ctx.lineWidth=1+Math.random()*3;ctx.beginPath();ctx.moveTo(Math.random()*512,0);ctx.bezierCurveTo(Math.random()*512,160,Math.random()*512,350,Math.random()*512,512);ctx.stroke();}
  } else if (finish === "stone") {
    for(let i=0;i<28;i++){ctx.globalAlpha=.16;ctx.strokeStyle=detail;ctx.lineWidth=1+Math.random()*2;ctx.beginPath();let x=Math.random()*512,y=0;ctx.moveTo(x,y);ctx.bezierCurveTo(x-90,160,x+100,320,x-40,512);ctx.stroke();}
  } else {
    for(let i=0;i<9000;i++){ctx.globalAlpha=.035+Math.random()*.06;ctx.fillStyle=detail;ctx.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*3,1+Math.random()*3);}
  }
  ctx.globalAlpha=1;
  const texture=new THREE.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=8;
  return texture;
}
function Box({ position, size, color, roughness = 0.75, metalness = 0, castShadow = true, finish }: {
  position: [number, number, number]; size: [number, number, number]; color: string;
  roughness?: number; metalness?: number; castShadow?: boolean; finish?: Finish;
}) {
  const map = useMemo(() => finish ? makeFinishTexture(finish) : undefined, [finish]);
  return <mesh position={position} castShadow={castShadow} receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} map={map} roughness={roughness} metalness={metalness} />
  </mesh>;
}

function RoomShell({ wall = "#687052", floor = "#b5a38b" }: { wall?: string; floor?: string }) {
  return <group>
    <Box position={[0, -0.09, 0]} size={[9, 0.18, 8]} color={floor} roughness={0.92} finish="stone" />
    <Box position={[0, 1.82, -3.94]} size={[9, 3.64, 0.14]} color={wall} roughness={0.94} finish="plaster" />
    <Box position={[-4.44, 1.82, 0]} size={[0.14, 3.64, 8]} color={wall} roughness={0.94} />
    <Box position={[4.44, 1.82, -3.1]} size={[0.14, 3.64, 1.7]} color={wall} roughness={0.94} />
    {/* A partial ceiling/soffit keeps the cutaway readable while showing ceiling design. */}
    <Box position={[0, 3.68, -3.05]} size={[8.8, 0.12, 1.7]} color="#e7e1d6" roughness={0.82} />
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
  return <>
    <color attach="background" args={["#d6d0c5"]} />
    <ambientLight intensity={0.72} />
    <hemisphereLight args={["#fff4df", "#746451", 0.8]} />
    <directionalLight position={[4, 8, 6]} intensity={2.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
    <pointLight position={[-2, 2.8, -2]} intensity={0.7} color="#f5d5a5" />
    {room === "living" ? <LivingRoom /> : room === "bedroom" ? <Bedroom /> : <Hospitality />}
    <ContactShadows position={[0, 0.015, 0]} opacity={0.32} scale={13} blur={2.8} far={5} />
    <OrbitControls makeDefault target={[0, 1.25, -0.55]} minDistance={7} maxDistance={13} minPolarAngle={0.62} maxPolarAngle={1.36} enablePan={false} autoRotate autoRotateSpeed={0.22} />
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
          <Canvas shadows camera={{ position: [9.2, 6.2, 11.5], fov: 43 }} dpr={[1, 1.6]}>
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
