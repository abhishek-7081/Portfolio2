import { AnimatePresence, motion } from 'framer-motion';

export default function Loader({ visible, label = 'Load Studio' }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
        >
          <motion.div
            className="page-loader__card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="page-loader__eyebrow">{label}</div>
            <div className="page-loader__title">Building the portfolio experience</div>
            <div className="page-loader__bar">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
