import re

with open('src/components/DashboardView.tsx', 'r') as f:
    content = f.read()

# Replace variants definition
old_variants = """  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    }
  };"""

new_variants = """  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    },
    hover: {
      y: -4,
      scale: 1.01,
      boxShadow: "0 10px 30px rgba(108, 99, 255, 0.15)",
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: {
      scale: 0.98
    }
  };"""

content = content.replace(old_variants, new_variants)
content = content.replace('variants={cardVariants}', 'variants={cardVariants} whileHover="hover" whileTap="tap"')

with open('src/components/DashboardView.tsx', 'w') as f:
    f.write(content)

