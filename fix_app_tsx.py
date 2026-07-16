with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("""  // Update dark mode class on document element
  useEffect(() => {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }""", "")

with open('src/App.tsx', 'w') as f:
    f.write(content)
