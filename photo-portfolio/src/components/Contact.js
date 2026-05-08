import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="contact-section">
      <motion.div
        className="contact-inner"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="section-label">צור קשר</p>
        <h2 className="section-title">בואו נעבוד יחד</h2>
        <p className="contact-desc">יש לך פרויקט בראש? אני כאן לשמוע.</p>

        {sent ? (
          <motion.div
            className="success-msg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ✓ הודעתך נשלחה בהצלחה!
          </motion.div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            {[
              { name: 'name', label: 'שם מלא', type: 'text' },
              { name: 'email', label: 'אימייל', type: 'email' },
            ].map((field, i) => (
              <motion.div
                key={field.name}
                className="form-group"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i + 0.3 }}
              >
                <label>{field.label}</label>
                <input type={field.type} required placeholder={field.label} />
              </motion.div>
            ))}

            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <label>הודעה</label>
              <textarea rows={5} required placeholder="ספר לי על הפרויקט..." />
            </motion.div>

            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.04, backgroundColor: '#fff', color: '#0a0a0a' }}
              whileTap={{ scale: 0.96 }}
            >
              שלח הודעה
            </motion.button>
          </form>
        )}
      </motion.div>

      <footer className="site-footer">
        <p>© 2025 LENS · כל הזכויות שמורות</p>
      </footer>
    </section>
  );
}

export default Contact;
