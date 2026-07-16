import re

with open('src/components/DashboardView.tsx', 'r') as f:
    content = f.read()

old_variants = """  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    },"""

new_variants = """  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: [0, -5, 0],
      transition: { 
        opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 4, repeat: float('inf'), ease: "easeInOut", repeatType: "reverse" }
      }
    },"""

new_variants_js = """  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: [0, -5, 0],
      transition: { 
        opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }
      }
    },"""

content = content.replace(old_variants, new_variants_js)

with open('src/components/DashboardView.tsx', 'w') as f:
    f.write(content)

