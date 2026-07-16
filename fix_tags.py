import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # We need to find all opening tags: `<div` and `<motion.div`
    # and all closing tags `</div>` and `</motion.div>`
    # We will just parse the file and keep a stack of tags.
    # When we encounter a closing tag, we pop from the stack and use the matching closing tag.
    
    tokens = re.split(r'(<motion\.div[^>]*>|<div[^>]*>|</div>|</motion\.div>|<motion\.h1[^>]*>|</motion\.h1>|<motion\.p[^>]*>|</motion\.p>|<motion\.button[^>]*>|</motion\.button>|<motion\.span[^>]*>|</motion\.span>)', content)
    
    stack = []
    for i in range(1, len(tokens), 2):
        tag = tokens[i]
        if tag.startswith('<motion.div'):
            stack.append('motion.div')
        elif tag.startswith('<div'):
            stack.append('div')
        elif tag.startswith('<motion.h1'):
            stack.append('motion.h1')
        elif tag.startswith('<motion.p'):
            stack.append('motion.p')
        elif tag.startswith('<motion.button'):
            stack.append('motion.button')
        elif tag.startswith('<motion.span'):
            stack.append('motion.span')
        elif tag.startswith('</'):
            if len(stack) > 0:
                expected = stack.pop()
                tokens[i] = f'</{expected}>'

    new_content = "".join(tokens)
    with open(filepath, 'w') as f:
        f.write(new_content)

for root, _, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            fix_file(os.path.join(root, f))
            
