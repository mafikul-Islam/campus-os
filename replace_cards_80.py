import os
import re

directory = 'src/components'
for filename in os.listdir(directory):
    if filename.endswith('.tsx'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()

        def replace_bg_white_80(match):
            cls = match.group(1)
            # if it's a card-like element
            if 'rounded-' in cls and ('p-' in cls or 'shadow' in cls or 'border' in cls):
                # replace bg-white/80 with glass-card if it exists as a whole word
                cls = re.sub(r'\bbg-white/80\b', 'glass-card', cls)
            return f'className="{cls}"'

        new_content = re.sub(r'className="([^"]+)"', replace_bg_white_80, content)

        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filename}")

