import React, { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

const CountUp = ({ value = 0, duration = 1.1, prefix = "", suffix = "" }) => {
  const nodeRef = useRef(null);
  const [display, setDisplay] = useState(0);
  const inView = useInView(nodeRef, { once: true, margin: "-20%" });

  useEffect(() => {
    if (!inView) {
      return;
    }

    const controls = animate(0, Number(value) || 0, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest))
    });

    return () => controls.stop();
  }, [duration, inView, value]);

  return <span ref={nodeRef}>{`${prefix}${display}${suffix}`}</span>;
};

export default CountUp;
