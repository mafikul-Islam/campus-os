import os
import re

files_to_process = [
    'src/components/AboutDevelopersView.tsx',
    'src/components/AnalyticsView.tsx',
    'src/components/AuthView.tsx',
    'src/components/CalendarView.tsx',
    'src/components/ChatsView.tsx',
    'src/components/DocumentsView.tsx',
    'src/components/LandingView.tsx',
    'src/components/NotepadView.tsx',
    'src/components/NotesView.tsx',
    'src/components/ProfileView.tsx'
]

def process_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # ensure motion is imported
    if "import { motion" not in content and "import { motion } from 'motion/react'" not in content:
        if "import React" in content:
            content = content.replace("import React", "import React from 'react';\nimport { motion } from 'motion/react';", 1)
        else:
            content = "import { motion } from 'motion/react';\n" + content

    # find all `<div` and match till closing `>`
    # if it has `glass-card`, replace `<div` with `<motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}`
    # AND find the matching `</div>` and replace with `</motion.div>`
    
    # Parse through characters
    i = 0
    while i < len(content):
        # find `<div`
        match = re.search(r'<div(\s+[^>]*?)>', content[i:])
        if not match:
            break
        
        start_idx = i + match.start()
        end_idx = i + match.end()
        inner_attrs = match.group(1)
        
        if 'glass-card' in inner_attrs and 'motion.div' not in content[start_idx:start_idx+15]:
            # Found a div with glass card!
            # Replace opening tag
            new_open = f'<motion.div animate={{{{ y: [0, -5, 0] }}}} transition={{{{ duration: 5, repeat: Infinity, ease: "easeInOut" }}}}{inner_attrs}>'
            content = content[:start_idx] + new_open + content[end_idx:]
            
            # Now find matching closing tag
            # We track nested divs
            nested = 1
            search_idx = start_idx + len(new_open)
            while nested > 0 and search_idx < len(content):
                open_div = content.find('<div', search_idx)
                close_div = content.find('</div', search_idx)
                
                if close_div == -1:
                    break
                
                if open_div != -1 and open_div < close_div:
                    nested += 1
                    search_idx = open_div + 4
                else:
                    nested -= 1
                    search_idx = close_div + 5
                    if nested == 0:
                        # Found it!
                        # The tag is </div >
                        end_close = content.find('>', search_idx) + 1
                        content = content[:close_div] + '</motion.div>' + content[end_close:]
                        break
                        
            i = start_idx + len(new_open)
        else:
            i = end_idx

    with open(filepath, 'w') as f:
        f.write(content)

for f in files_to_process:
    process_file(f)
    
