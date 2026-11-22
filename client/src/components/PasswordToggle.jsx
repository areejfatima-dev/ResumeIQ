import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordToggle({ visible, onToggle }) {
  const [focused, setFocused] = useState(false);
  const label = visible ? "Hide password" : "Show password";

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      whileHover={{ color: "#5EEAD4", scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      style={{
        ...styles.button,
        color: focused ? "#5EEAD4" : "#7C8A96",
        boxShadow: focused ? "0 0 0 2px #5EEAD455" : "none",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={visible ? "hidden" : "visible"}
          initial={{ opacity: 0, scale: 0.6, rotate: -25 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 25 }}
          transition={{ duration: 0.15 }}
          style={styles.icon}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

const styles = {
  button: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    padding: 0,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    outline: "none",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
