import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Gallery.css';

const photos = [
  { id: 1, title: 'שקיעה בים', category: 'נוף', color: '#1a1a2e', accent: '#e8c97a' },
  { id: 2, title: 'עיר בלילה', category: 'עירוני', color: '#0d1b2a', accent: '#4fc3f7' },
  { id: 3, title: 'פורטרט', category: 'אנשים', color: '#1c1c1c', accent: '#f48fb1' },
  { id: 4, title: 'יער קסום', category: 'טבע', color: '#0a1f0a', accent: '#81c784' },
  { id: 5, title: 'מדבר זהוב', category: 'נוף', color: '#2d1b00', accent: '#ffb74d' },
  { id: 6, title: 'אדריכלות', category: 'עירוני', color: '#12121f', accent: '#ce93d8' },
];

const categories = ['הכל', 'נוף', 'עירוני', 'אנשים', 'טבע'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
};

function Gallery() {
  const [activeCategory, setActiveCategory] = useState('הכל');
  const [selected, setSelected] = useState(null);

  const filtered = activeCategory === 'הכל'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  return (
    <section id="gallery" className="gallery-section">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="section-label">עבודות</p>
        <h2 className="section-title">גלריה</h2>
      </motion.div>

      <motion.div
        className="category-filters"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {categories.map(cat => (
          <motion.button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        className="photo-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        key={activeCategory}
      >
        {filtered.map(photo => (
          <motion.div
            key={photo.id}
            className="photo-card"
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            onClick={() => setSelected(photo)}
            style={{ background: `linear-gradient(135deg, ${photo.color} 0%, #1a1a1a 100%)` }}
          >
            <div className="photo-placeholder">
              <div className="photo-accent-circle" style={{ background: photo.accent }} />
            </div>
            <div className="photo-info">
              <span className="photo-category">{photo.category}</span>
              <h3 className="photo-title">{photo.title}</h3>
            </div>
            <motion.div
              className="photo-overlay"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <span>צפה</span>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{ background: `linear-gradient(135deg, ${selected.color} 0%, #1a1a1a 100%)` }}
            >
              <div className="lightbox-img-area">
                <div className="lightbox-circle" style={{ background: selected.accent }} />
              </div>
              <div className="lightbox-info">
                <span className="photo-category">{selected.category}</span>
                <h2>{selected.title}</h2>
                <p>צילום מקצועי ברמה הגבוהה ביותר</p>
              </div>
              <button className="lightbox-close" onClick={() => setSelected(null)}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Gallery;
