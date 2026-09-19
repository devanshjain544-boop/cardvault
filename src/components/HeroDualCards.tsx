import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react';
import { ShieldCheck, Eye, RefreshCw } from 'lucide-react';

export const HeroDualCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCard, setActiveCard] = useState<'card1' | 'card2'>('card1');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Motion values for normalized cursor (-1 to 1)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth springs for fluid, physics-based movement
  const springConfig = { damping: 22, stiffness: 140, mass: 0.8 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  // 3D rotations for Card 1 (Front: CV ARCHIVE 001)
  const card1RotateX = useTransform(smoothY, [-1, 1], [16, -16]);
  const card1RotateY = useTransform(smoothX, [-1, 1], [-18, 18]);
  const card1TranslateX = useTransform(smoothX, [-1, 1], [-18, 26]);
  const card1TranslateY = useTransform(smoothY, [-1, 1], [-16, 20]);
  const card1Z = useTransform(smoothX, () => (isHovered ? 45 : 20));

  // 3D rotations and fan-out for Card 2 (Back: CARDVAULT ARCHIVE 02)
  // When cursor comes on, Card 2 spreads dramatically out from behind Card 1!
  const card2RotateX = useTransform(smoothY, [-1, 1], [12, -12]);
  const card2RotateY = useTransform(smoothX, [-1, 1], [-14, 14]);
  const card2RotateZ = useTransform(smoothX, [-1, 1], [-20, -6]);
  const card2TranslateX = useTransform(smoothX, [-1, 1], [-85, -40]);
  const card2TranslateY = useTransform(smoothY, [-1, 1], [10, 45]);
  const card2Scale = useTransform(smoothY, [-1, 1], [0.94, 0.98]);

  // Specular light sheen gradient position
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = ((x / rect.width) * 2 - 1);
    const normY = ((y / rect.height) * 2 - 1);

    rawX.set(Math.max(-1, Math.min(1, normX)));
    rawY.set(Math.max(-1, Math.min(1, normY)));

    setGlarePos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rawX.set(0);
    rawY.set(0);
    setGlarePos({ x: 50, y: 50 });
  };

  // Touch handlers for mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const normX = ((x / rect.width) * 2 - 1);
    const normY = ((y / rect.height) * 2 - 1);

    rawX.set(Math.max(-1, Math.min(1, normX * 0.8)));
    rawY.set(Math.max(-1, Math.min(1, normY * 0.8)));
    setIsHovered(true);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    rawX.set(0);
    rawY.set(0);
  };

  const toggleCardOrder = () => {
    setActiveCard(prev => (prev === 'card1' ? 'card2' : 'card1'));
  };

  return (
    <div 
      className="relative w-full py-8 flex items-center justify-center select-none"
      style={{ perspective: 1400 }}
    >
      {/* Background Archival Radial Rings & Text (Exact reference from Screenshot 1) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
        {/* Outer orbital circle */}
        <div className="w-[480px] sm:w-[560px] h-[480px] sm:h-[560px] rounded-full border border-amber-500/20 animate-[spin_120s_linear_infinite]" />
        {/* Mid orbital circle */}
        <div className="absolute w-[380px] sm:w-[440px] h-[380px] sm:h-[440px] rounded-full border border-amber-500/15 border-dashed" />
        {/* Inner glow circle */}
        <div className="absolute w-[260px] sm:w-[300px] h-[260px] sm:h-[300px] rounded-full border border-amber-400/30" />

        {/* Ambient radial lighting in soft warm amber glow */}
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-amber-500/25 via-amber-400/15 to-transparent blur-3xl" />

        {/* Outer Archival Curved Label */}
        <div className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <div 
            className="text-[10px] uppercase font-mono tracking-[0.35em] text-amber-300/40 rotate-90 origin-center whitespace-nowrap"
            style={{ transform: 'rotate(90deg) translateY(-50%)' }}
          >
            ARCHIVAL SERIES · CARDVAULT · 001/002
          </div>
        </div>
      </div>

      {/* Interactive Cursor Tracking Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={toggleCardOrder}
        className="relative w-[320px] sm:w-[350px] md:w-[380px] h-[460px] sm:h-[500px] cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Subtle interactive hint */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 opacity-90 hover:opacity-100 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1C130E]/90 border border-[#5A3F31] shadow-lg text-[10px] font-mono tracking-widest text-amber-300 whitespace-nowrap">
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
          <span>HOVER TO MOVE · CLICK TO SWAP</span>
        </div>

        {/* ======================================================== */}
        {/* CARD 2: BACK CARD (CARDVAULT / ARCHIVE / 02)             */}
        {/* Moves & fans out dynamically when cursor moves!          */}
        {/* ======================================================== */}
        <motion.div
          animate={
            isHovered
              ? {}
              : {
                  y: [18, 28, 18],
                  rotateZ: [-14, -11, -14],
                  transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
                }
          }
          style={{
            transformStyle: 'preserve-3d',
            x: isHovered ? card2TranslateX : -45,
            y: isHovered ? card2TranslateY : 20,
            rotateX: card2RotateX,
            rotateY: card2RotateY,
            rotateZ: isHovered ? card2RotateZ : -12,
            scale: isHovered ? card2Scale : 0.94,
            zIndex: activeCard === 'card2' ? 25 : 10,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 120 }}
          className="absolute w-[270px] sm:w-[295px] h-[390px] sm:h-[425px] rounded-[22px] bg-white/[0.10] p-3 border-2 border-white/40 shadow-[0_25px_50px_-10px_rgba(0,0,0,0.6),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(255,255,255,0.1)] backdrop-blur-xl overflow-hidden transition-shadow"
        >
          {/* Glass Slab Diagonal Surface Sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 pointer-events-none rounded-[22px]" />
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-white/20 rounded-full blur-xl pointer-events-none" />

          {/* Translucent Glass Slab Header */}
          <div className="relative z-10 bg-white/15 border border-white/25 rounded-lg p-2 mb-2.5 flex items-center justify-between text-left backdrop-blur-md shadow-xs">
            <div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-white">
                CARDVAULT / ARCHIVE / 02
              </div>
              <div className="text-[9px] font-mono text-amber-300 font-semibold">SERIES II · REFRACTOR EDITION</div>
            </div>
            <div className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-300/50 text-[9px] font-mono font-bold text-amber-200">
              GRADE 9.5
            </div>
          </div>

          {/* Card 2 Inner Artwork Face (Transparent Crystal Glass Refractor) */}
          <div className="relative w-full h-[300px] sm:h-[330px] rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.08] via-amber-950/20 to-black/35 border border-white/25 flex flex-col items-center justify-between p-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-md">
            {/* Fine contour wave line art in luminous gold */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FBBF24" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#FBBF24" strokeWidth="0.5" strokeDasharray="1,2" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#FDE68A" strokeWidth="0.5" />
                <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="#F59E0B" strokeWidth="0.5" />
                <path d="M0,70 Q30,40 60,70 T100,70" fill="none" stroke="#D97706" strokeWidth="0.5" />
              </svg>
            </div>

            {/* Top Serial */}
            <div className="w-full flex items-center justify-between text-[9px] font-mono font-semibold text-amber-200 z-10">
              <span>EDITION 02/50</span>
              <span className="text-emerald-300">100% VERIFIED</span>
            </div>

            {/* Center Monogram Visual on Frosted Glass Disc */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="w-20 h-20 rounded-full border border-amber-300/60 flex items-center justify-center bg-white/10 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                <span className="text-3xl font-serif italic text-amber-200 tracking-wider font-bold">
                  CV
                </span>
              </div>
              <p className="mt-3 text-[10px] uppercase font-mono tracking-[0.25em] text-amber-200 font-bold">
                ARCHIVAL GRAIL
              </p>
            </div>

            {/* Bottom info */}
            <div className="w-full flex items-center justify-between text-[8px] font-mono text-amber-100/70 border-t border-white/15 pt-2 z-10">
              <span>TAMPER-SEALED</span>
              <span>MUMBAI VAULT</span>
            </div>

            {/* Prismatic Holo Foil light reflection */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-screen"
              style={{
                background: `radial-gradient(circle at ${100 - glarePos.x}% ${100 - glarePos.y}%, rgba(245, 158, 11, 0.4) 0%, transparent 60%)`,
                opacity: isHovered ? 1 : 0.4
              }}
            />
          </div>

          {/* Bottom acrylic footer */}
          <div className="relative z-10 mt-1.5 flex items-center justify-between px-1 text-[8px] font-mono text-stone-300 font-medium">
            <span>REG. NO: #CV-8910-B</span>
            <span className="text-amber-300">CARDVAULT AUTHENTIC</span>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* CARD 1: FRONT CARD (CV ARCHIVE / COLLECTOR / 001)        */}
        {/* Crisp white acrylic slab with golden accents & CURATED 10*/}
        {/* ======================================================== */}
        <motion.div
          animate={
            isHovered
              ? {}
              : {
                  y: [-8, 6, -8],
                  rotateZ: [-2, 2, -2],
                  transition: { repeat: Infinity, duration: 5, ease: 'easeInOut' }
                }
          }
          style={{
            transformStyle: 'preserve-3d',
            x: isHovered ? card1TranslateX : 10,
            y: isHovered ? card1TranslateY : 0,
            rotateX: card1RotateX,
            rotateY: card1RotateY,
            z: card1Z,
            scale: isHovered ? 1.05 : 1,
            zIndex: activeCard === 'card1' ? 25 : 15,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 130 }}
          className="relative w-[285px] sm:w-[315px] h-[415px] sm:h-[455px] rounded-[24px] bg-white/[0.12] p-3.5 border-2 border-white/50 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(255,255,255,0.15)] backdrop-blur-2xl overflow-hidden group"
        >
          {/* Glass Surface Diagonal Sheen & Edge Highlights */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none rounded-[24px]" />
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 rounded-[22px] border border-white/35 pointer-events-none" />

          {/* Translucent Glass Slab Header (CV ARCHIVE / COLLECTOR / 001) */}
          <div className="relative z-10 bg-white/15 border border-white/30 rounded-xl p-2.5 mb-2.5 flex items-center justify-between text-left backdrop-blur-lg shadow-xs">
            <div>
              <div className="text-[11px] font-mono font-black tracking-wider text-white uppercase">
                CV ARCHIVE
              </div>
              <div className="text-[10px] font-mono tracking-wide text-amber-200 font-medium">
                COLLECTOR / 001
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-mono font-black tracking-wider shadow-xs">
              <ShieldCheck className="w-3 h-3 text-stone-950" />
              <span>AUTHENTIC</span>
            </div>
          </div>

          {/* Card 1 Art Face (Transparent Crystal Glass Face with Luminous Rings) */}
          <div className="relative w-full h-[320px] sm:h-[355px] rounded-xl overflow-hidden bg-gradient-to-b from-white/[0.12] via-amber-950/20 to-black/45 border border-white/30 flex flex-col items-center justify-between p-5 shadow-[inset_0_0_25px_rgba(255,255,255,0.12)] backdrop-blur-lg">
            {/* Luminous Golden Concentric Geometric Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
              <div className="w-48 h-48 rounded-full border border-amber-300/60" />
              <div className="absolute w-36 h-36 rounded-full border border-amber-400/50 border-dashed" />
              <div className="absolute w-24 h-24 rounded-full border border-amber-200/70" />
            </div>

            {/* Top Serial & Rarity */}
            <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold tracking-widest text-amber-200 z-10">
              <span>AUTHENTICATED 10</span>
              <span className="text-amber-300">1 OF 1 SPECIMEN</span>
            </div>

            {/* Center Iconography: Bronze/Gold Medallion & CV Monogram */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <div className="w-full h-full rounded-full bg-stone-900/60 backdrop-blur-md flex items-center justify-center border border-white/25">
                  <span className="text-4xl font-serif italic font-bold text-amber-200 tracking-wider">
                    CV
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[11px] font-mono font-extrabold tracking-[0.25em] text-white uppercase">
                THE COLLECTOR VAULT
              </p>
              <p className="text-[9px] font-mono text-amber-200/80 tracking-wider font-semibold">
                CURATED VAULT · INR
              </p>
            </div>

            {/* Bottom Proof Line */}
            <div className="w-full flex items-center justify-between text-[8px] font-mono text-amber-100/70 font-medium border-t border-white/15 pt-2 z-10">
              <span>MINT CENTERING 50/50</span>
              <span>SERIAL: #CV-2026-001</span>
            </div>

            {/* Bottom-Right "CURATED 10" Slab Badge on Frosted Glass */}
            <div className="absolute bottom-3 right-3 z-20 bg-white/20 backdrop-blur-lg border border-amber-400/90 rounded-lg px-2.5 py-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center">
              <span className="text-[8px] font-mono font-extrabold text-amber-300 uppercase tracking-widest leading-none">
                CURATED
              </span>
              <span className="text-sm font-mono font-black text-white leading-tight">
                10
              </span>
            </div>

            {/* Dynamic Specular Light Glare Sweeping with Cursor */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200 mix-blend-screen"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(245, 158, 11, 0.25) 40%, transparent 65%)`,
                opacity: isHovered ? 1 : 0.4,
              }}
            />

            {/* Rainbow Prismatic Oil-Slick Holographic Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen transition-transform duration-300"
              style={{
                background:
                  'linear-gradient(115deg, transparent 20%, rgba(245,158,11,0.25) 35%, rgba(147,197,253,0.3) 50%, rgba(244,114,182,0.25) 65%, transparent 80%)',
                transform: `translateX(${(glarePos.x - 50) * 1.5}%) translateY(${(glarePos.y - 50) * 1.5}%)`,
              }}
            />
          </div>

          {/* Bottom acrylic footer seal */}
          <div className="relative z-10 mt-1.5 flex items-center justify-between px-1 text-[8px] font-mono text-stone-300 font-medium">
            <span className="text-amber-300 font-bold">
              CV
            </span>
            <span className="text-stone-300">CARDVAULT SLABS</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
