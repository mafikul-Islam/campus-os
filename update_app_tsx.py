import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Pass onUpdateProfile
content = content.replace("                  onUploadRoutineTrigger={() => {\n                    localStorage.setItem('campus_open_routine_upload', 'true');\n                    navigateTo('dashboard');\n                  }}\n                />", "                  onUploadRoutineTrigger={() => {}}\n                  onUpdateProfile={handleUpdateProfile}\n                />")

with open('src/App.tsx', 'w') as f:
    f.write(content)

