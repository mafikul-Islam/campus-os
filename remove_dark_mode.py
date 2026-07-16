import re

with open('src/components/ProfileView.tsx', 'r') as f:
    content = f.read()

# Remove handleToggleDarkMode
content = re.sub(r'  const handleToggleDarkMode = \(\) => \{[\s\S]*?\};\n', '', content)

# Remove the dark mode toggle block
content = re.sub(r'\s*\{\/\* Dark Mode Toggle \*\/\}[\s\S]*?bg-slate-100\/80" \/\>', '', content)

with open('src/components/ProfileView.tsx', 'w') as f:
    f.write(content)

