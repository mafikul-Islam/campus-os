import re

with open('src/components/DashboardView.tsx', 'r') as f:
    content = f.read()

# Add import for RoutineUploadModal
if "import RoutineUploadModal from './RoutineUploadModal';" not in content:
    content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport RoutineUploadModal from './RoutineUploadModal';")

# Remove all handleRoutineFileUpload logic and state from DashboardView
content = re.sub(r'  const \[isRoutineAnalyzing, setIsRoutineAnalyzing\] = useState\(false\);\n  const \[analyzingStep, setAnalyzingStep\] = useState\(0\);\n  const \[uploadedFileName, setUploadedFileName\] = useState\(\'\'\);\n', '', content)
content = re.sub(r'  // Handle Routine File Upload.*?\n  };\n', '', content, flags=re.DOTALL)

# Remove hidden file inputs
content = re.sub(r'      \{\/\* HIDDEN FILE INPUTS FOR ROUTINE CARDS \*\/\}[\s\S]*?className="hidden" \n      \/\>\n', '', content)

# Remove the analyzing overlay block
content = re.sub(r'      \{\/\* 1\. OCR Analyzing Overlay \*\/\}[\s\S]*?<\/AnimatePresence>\n', '', content)

# Remove the routine upload selector modal block
content = re.sub(r'      \{\/\* ROUTINE UPLOAD SELECTOR MODAL \*\/\}[\s\S]*?<\/AnimatePresence>\n', '', content)

# Instead, insert RoutineUploadModal where the modal block used to be (or just at the end before </div>)
content = content.replace("    </div>\n  );\n}", """      <RoutineUploadModal 
        isOpen={isRoutinePopupOpen} 
        onClose={() => setIsRoutinePopupOpen(false)} 
        profile={profile} 
        onUpdateProfile={onUpdateProfile} 
        onSyncRoutineEvents={onSyncRoutineEvents} 
      />
    </div>
  );
}""")

with open('src/components/DashboardView.tsx', 'w') as f:
    f.write(content)

