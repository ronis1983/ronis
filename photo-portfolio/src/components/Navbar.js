import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Navbar.css';

const links = ['גלריה', 'אודות', 'צור קשר'];
const linkIds = ['gallery', 'about', 'contact'];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        className="navbar-logo"
        whileHover={{ scale: 1.05 }}
      >
        LENS
      </motion.div>

      <ul className="navbar-links">
        {links.map((link, i) => (
          <motion.li
            key={link}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.4 }}
          >
            <motion.button
              className="nav-link"
              onClick={() => scrollTo(linkIds[i])}
              whileHover={{ color: '#fff', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {link}
            </motion.button>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}

export default Navbar;
