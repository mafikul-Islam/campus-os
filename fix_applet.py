with open('src/components/DashboardView.tsx', 'a') as f:
    f.write("""      <RoutineUploadModal 
        isOpen={isRoutinePopupOpen} 
        onClose={() => setIsRoutinePopupOpen(false)} 
        profile={profile} 
        onUpdateProfile={onUpdateProfile} 
        onSyncRoutineEvents={onSyncRoutineEvents} 
      />
    </motion.div>
  );
}""")
