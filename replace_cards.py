import os
import re

directory = 'src/components'
for filename in os.listdir(directory):
    if filename.endswith('.tsx'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()

        # Find classes that have bg-white, rounded-..., p-... and replace bg-white with glass-card
        # We can just look for `bg-white` inside a className string that also has `rounded-`
        
        def replace_bg_white(match):
            cls = match.group(1)
            # if it's a card-like element
            if 'rounded-' in cls and ('p-' in cls or 'shadow' in cls or 'border' in cls):
                # replace bg-white with glass-card if it exists as a whole word
                cls = re.sub(r'\bbg-white\b', 'glass-card', cls)
            return f'className="{cls}"'

        new_content = re.sub(r'className="([^"]+)"', replace_bg_white, content)

        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filename}")

