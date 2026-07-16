import re

with open('src/components/NotesView.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="glass-card', 'whileHover={{ y: -4, scale: 1.01, boxShadow: "0px 10px 30px rgba(108, 99, 255, 0.15)" }} whileTap={{ scale: 0.98 }} className="glass-card cursor-pointer')

with open('src/components/NotesView.tsx', 'w') as f:
    f.write(content)
