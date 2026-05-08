import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />

      <div className="hero-content">
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          פורטפוליו צילום
        </motion.p>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          רגעים שנשארים
          <br />
          <span className="hero-title-accent">לנצח</span>
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          כל תמונה מספרת סיפור. כל רגע הוא נצח.
        </motion.p>

        <motion.button
          className="hero-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          whileHover={{ scale: 1.06, backgroundColor: '#fff', color: '#0a0a0a' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
        >
          צפה בגלריה
        </motion.button>
      </div>

      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1.8, duration: 1.5, repeat: Infinity }}
      >
        ↓
      </motion.div>
    </section>
  );
}

export default Hero;
