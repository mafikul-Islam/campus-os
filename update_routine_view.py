import re

with open('src/components/RoutineView.tsx', 'r') as f:
    content = f.read()

# Add onUpdateProfile to props
content = content.replace("  onUploadRoutineTrigger: () => void;\n}", "  onUploadRoutineTrigger: () => void;\n  onUpdateProfile: (profile: UserProfile) => void;\n}")

# Add it to component arguments
content = content.replace("  onUploadRoutineTrigger \n}: RoutineViewProps) {", "  onUploadRoutineTrigger,\n  onUpdateProfile\n}: RoutineViewProps) {")
content = content.replace("  onUploadRoutineTrigger\n}: RoutineViewProps) {", "  onUploadRoutineTrigger,\n  onUpdateProfile\n}: RoutineViewProps) {")
content = content.replace("  onUploadRoutineTrigger \n}: RoutineViewProps", "  onUploadRoutineTrigger,\n  onUpdateProfile\n}: RoutineViewProps")

# Add useState and import RoutineUploadModal
if "import { useState } from 'react';" not in content:
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';")

content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'framer-motion';")
content = "import RoutineUploadModal from './RoutineUploadModal';\n" + content

# Add state
content = content.replace("  const [selectedDay, setSelectedDay] =", "  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);\n  const [selectedDay, setSelectedDay] =")

# Change button onClick
content = content.replace("onClick={onUploadRoutineTrigger}", "onClick={() => setIsUploadModalOpen(true)}")

# Add RoutineUploadModal at the end
content = content.replace("    </div>\n  );\n}", """      <RoutineUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        profile={profile} 
        onUpdateProfile={onUpdateProfile} 
        onSyncRoutineEvents={onSyncRoutineEvents} 
      />
    </div>
  );
}""")

with open('src/components/RoutineView.tsx', 'w') as f:
    f.write(content)

