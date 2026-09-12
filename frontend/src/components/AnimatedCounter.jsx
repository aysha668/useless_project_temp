import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedCounter({ value, decimals = 0, suffix = '' }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => v.toFixed(decimals) + suffix);
  const [text, setText] = useState('0' + suffix);

  useEffect(() => {
    spring.set(Number(value) || 0);
    return display.on('change', setText);
  }, [value, spring, display, decimals, suffix]);

  return <motion.span>{text}</motion.span>;
}
