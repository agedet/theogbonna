import { useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  opacity: number;
  blinkOffset: number;
  blinkSpeed: number;
}

interface CharProps {
  char: string;
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
  dims: boolean;
  dimStart: number;
  dimEnd: number;
}

// ─── Animated character ───────────────────────────────────────────────────────

function AnimatedChar({ char, scrollYProgress, start, end, dims, dimStart, dimEnd }: CharProps) {
  // Hook must be called unconditionally — early return for spaces comes AFTER.
  const color = useTransform(
    scrollYProgress,
    dims
      ? [0, start, end, dimStart, dimEnd]
      : [0, start, end],
    dims
      ? ['#2A2A2A', '#2A2A2A', '#FFFFFF', '#FFFFFF', '#2A2A2A']
      : ['#2A2A2A', '#2A2A2A', '#FFFFFF']
  );

  if (char === ' ') {
    return <span style={{ display: 'inline-block', width: '0.25em' }}> </span>;
  }

  return (
    <motion.span style={{ display: 'inline-block', color, willChange: 'color' }}>
      {char}
    </motion.span>
  );
}

// ─── Particle canvas ──────────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);

    const count = window.innerWidth < 768 ? 80 : 250;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.1,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.5 + 0.1,
      blinkOffset: Math.random() * Math.PI * 2,
      blinkSpeed: Math.random() * 0.02 + 0.01,
    }));
  }, []);

  useEffect(() => {
    init();

    // Defining animate inside useEffect avoids the "accessed before declaration"
    // circular dependency that arises when useCallback references itself.
    function animate() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particlesRef.current.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.blinkOffset += p.blinkSpeed;

        const currentOpacity = Math.max(0, Math.min(1, p.opacity + Math.sin(p.blinkOffset) * 0.15));

        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const LINE_1 = "A legacy of love, a lifetime of warmth.";
const LINE_2_DIM = "Their hands guided us, their wisdom shaped us.";
// const LINE_2_LIT = "and their memories will forever illuminate our paths.";

function buildChars(text: string) {
  return text.split('');
}

export default function ScrollRevealText() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.5 });

  const PHASE1_START = 0;
  const PHASE1_END = 0.55;
  const PHASE3_START = 0.65;
  const PHASE3_END = 0.85;

  const line1Chars = buildChars(LINE_1);
  const line2DimChars = buildChars(LINE_2_DIM);
  // const line2LitChars = buildChars(LINE_2_LIT);

  const allChars = [...line1Chars, ' ', ...line2DimChars];
  const totalChars = allChars.length;

  const line1End = line1Chars.length + 1;
  // const line2DimEnd = line1End + line2DimChars.length + 1;

  function getCharRange(globalIndex: number): [number, number] {
    const startFrac = PHASE1_START + (globalIndex / totalChars) * (PHASE1_END - PHASE1_START);
    const step = (PHASE1_END - PHASE1_START) / totalChars;
    const endFrac = Math.min(startFrac + step * 3, PHASE1_END);
    return [startFrac, endFrac];
  }

  const subtextOpacity = useTransform(smoothProgress, [PHASE3_START, PHASE3_END], [0, 1]);
  const subtextY = useTransform(smoothProgress, [PHASE3_START, PHASE3_END], [24, 0]);

  return (
    <section id="memories" style={{ backgroundColor: '#050505', position: 'relative' }}>
      <ParticleCanvas />

      {/* Top spacer */}
      <div style={{ height: '50vh', position: 'relative', zIndex: 10 }} />

      {/* 400vh scroll track */}
      <div ref={sectionRef} style={{ height: '400vh', width: '100%', position: 'relative' }}>
        {/* Sticky viewport */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 1.5rem',
            zIndex: 10,
          }}
        >
          {/* Main headline */}
          <div
            style={{
              textAlign: 'center',
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              zIndex: 20,
              maxWidth: '100rem',
            }}
            className="text-lg md:text-3xl lg:text-4xl xl:text-6xl"
          >
            {/* Line 1 — dims later */}
            <div>
              {line1Chars.map((char, i) => {
                const [s, e] = getCharRange(i);
                return (
                  <AnimatedChar
                    key={`l1-${i}`}
                    char={char}
                    scrollYProgress={smoothProgress}
                    start={s}
                    end={e}
                    dims={true}
                    dimStart={PHASE3_START}
                    dimEnd={PHASE3_END}
                  />
                );
              })}
            </div>

            {/* Line 2 */}
            <div style={{ marginTop: '0.25em' }}>
              <span>
                {line2DimChars.map((char, i) => {
                  const globalIndex = line1End + i;
                  const [s, e] = getCharRange(globalIndex);
                  return (
                    <AnimatedChar
                      key={`l2d-${i}`}
                      char={char}
                      scrollYProgress={smoothProgress}
                      start={s}
                      end={e}
                      dims={true}
                      dimStart={PHASE3_START}
                      dimEnd={PHASE3_END}
                    />
                  );
                })}
              </span>
              {/* <span>
                {' '}
                {line2LitChars.map((char, i) => {
                  const globalIndex = line2DimEnd + i;
                  const [s, e] = getCharRange(globalIndex);
                  return (
                    <AnimatedChar
                      key={`l2l-${i}`}
                      char={char}
                      scrollYProgress={smoothProgress}
                      start={s}
                      end={e}
                      dims={false}
                      dimStart={PHASE3_START}
                      dimEnd={PHASE3_END}
                    />
                  );
                })}
              </span> */}
            </div>
          </div>

          {/* Subtext — fades in as phase-3 begins */}
          <motion.div
            style={{
              opacity: subtextOpacity,
              y: subtextY,
              marginTop: '3rem',
              maxWidth: '42rem',
              zIndex: 20,
              textAlign: 'center',
            }}
          >
            <p
              style={{ color: '#9CA3AF', fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '0.05em', lineHeight: 1.8 }}
              className="md:text-sm"
            >
              {/* A legacy of love, a lifetime of warmth.  */}
              {/* Their hands guided us, their wisdom shaped us. */}
              Their memories will forever illuminate our paths, a timeless reminder of who we are and where we come from.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '50vh', position: 'relative', zIndex: 10 }} />
    </section>
  );
}
