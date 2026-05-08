import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const stats = [
  { value: '10+', label: 'שנות ניסיון' },
  { value: '500+', label: 'לקוחות מרוצים' },
  { value: '5000+', label: 'תמונות צולמו' },
];

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-inner">
        <motion.div
          className="about-visual"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <div className="about-image-frame">
            <div className="about-image-bg" />
            <div className="about-image-accent" />
          </div>
        </motion.div>

        <motion.div
          className="about-text"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <p className="section-label">אודות</p>
          <h2 className="section-title">הסיפור שלי</h2>
          <p className="about-desc">
            אני מאמין שכל תמונה טובה מתחילה ברגע אמיתי. מאז גיל צעיר הצלמתי את העולם דרך עיניים סקרניות — עיר בשעות הקטנות, אור שקיעה על מים, הבעת פנים שאי אפשר לבים.
          </p>
          <p className="about-desc">
            הצילום עבורי הוא שפה. כל פריים הוא משפט, וכל אלבום הוא סיפור שלם.
          </p>

          <div className="stats-row">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.15 }}
              >
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default About;
