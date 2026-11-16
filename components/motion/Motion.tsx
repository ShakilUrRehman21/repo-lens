'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type CSSProperties, type ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

type Base = { children?: ReactNode; className?: string; style?: CSSProperties };

/** Fades and lifts content in when it scrolls into view. */
export function Reveal({ children, className, style, delay = 0, y = 32 }: Base & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Container that reveals its StaggerItem children one after another. */
export function Stagger({ children, className, style, gap = 0.09 }: Base & { gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }: Base) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 36, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Moves content slightly slower than the page while scrolling. */
export function Parallax({ children, className, style, offset = 60 }: Base & { offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [offset, -offset]);
  return (
    <motion.div ref={ref} className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  );
}

/** Gentle endless bobbing. */
export function Float({ children, className, style, distance = 10, duration = 5, delay = 0 }: Base & { distance?: number; duration?: number; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      animate={reduce ? undefined : { y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/** Thin bar at the top of the viewport that tracks scroll progress. */
export function ScrollProgress({ color }: { color: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: '0 50%', position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: color, zIndex: 100 }}
    />
  );
}

/** Route-level fade used by app/template. Opacity only, so fixed sidebars are unaffected. */
export function PageFade({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease }}>
      {children}
    </motion.div>
  );
}
