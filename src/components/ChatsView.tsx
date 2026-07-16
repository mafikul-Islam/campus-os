import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Search, 
  Plus, 
  Phone, 
  Video, 
  MoreVertical, 
  Camera, 
  Paperclip, 
  Mic, 
  Smile, 
  Send, 
  Check, 
  CheckCheck, 
  User, 
  Users, 
  X, 
  Sparkles,
  Info,
  Play,
  FileText,
  Trash2,
  Pin,
  VolumeX,
  Volume2,
  ChevronRight,
  ShieldCheck,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { UserProfile } from '../types';

interface Message {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderInitials?: string;
  text: string;
  time: string;
  isSelf: boolean;
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  file?: { name: string; size: string; type: string };
  isVoice?: boolean;
  voiceDuration?: string;
}

interface ChatSession {
  id: string;
  name: string;
  subtitle: string;
  isGroup: boolean;
  avatarUrl?: string;
  avatarInitials: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
  isPinned?: boolean;
  isMuted?: boolean;
}

interface ChatsViewProps {
  profile: UserProfile;
  onBack?: () => void;
}

export default function ChatsView({ profile, onBack }: ChatsViewProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'group'>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  
  // Custom contact selection states
  const [newChatName, setNewChatName] = useState('');
  const [newChatType, setNewChatType] = useState<'personal' | 'group'>('personal');

  // Academic-X Ask Me State
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // Attachment refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji picker states
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiContainerRef = useRef<HTMLDivElement>(null);
  
  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive device state
  const [isMobile, setIsMobile] = useState(false);

  // Chat dropdown action menu
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Group Details Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Listen for screen resize to manage responsive split-pane vs single-screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const emojis = [
    '😀', '👍', '❤️', '🔥', '✨', '🎉', '💡', '📚', '🎓', '💻',
    '😅', '😂', '😉', '😍', '🥰', '🤔', '🙌', '👏', '🚀', '💯'
  ];

  // Quick Action response chips
  const quickResponses = [
    "Got it! 👍",
    "I'm on my way! 🏃",
    "In a lecture right now 🎓",
    "Let me check and get back to you",
    "Can you share the slides/PDF? 📝",
    "Sure, let's meet up!"
  ];

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const handleEmojiClick = (emoji: string) => {
    setTypedMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Message scroll ref
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initial Demo Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'g1',
      name: '7th Semester - Section A',
      subtitle: 'Active Now',
      isGroup: true,
      avatarInitials: '7S',
      unreadCount: 3,
      lastMessage: 'Golam Rabbi: Hlw',
      lastMessageTime: '02:56 AM',
      isPinned: true,
      messages: [
        { id: 'm1', senderName: 'AM Pritam', senderInitials: 'AP', text: 'hi', time: '04:22 PM', isSelf: false },
        { id: 'm2', senderName: 'Shah Nazib Mahmud', senderInitials: 'SM', text: 'Hlw', time: '07:21 PM', isSelf: false },
        { id: 'm3', senderName: 'Shah Nazib Mahmud', senderInitials: 'SM', text: 'Ok', time: '11:58 AM', isSelf: false },
        { id: 'm4', senderName: 'Golam Rabbi', senderInitials: 'GR', text: 'Hlw', time: '02:56 AM', isSelf: false },
        { id: 'm5', senderName: 'Me', text: 'Ok', time: '02:03 PM', isSelf: true, status: 'read' },
        { id: 'm6', senderName: 'Me', text: 'Hlw cr', time: '11:35 AM', isSelf: true, status: 'read' }
      ]
    },
    {
      id: 'g2',
      name: 'CSE 301 - Database Systems Group',
      subtitle: 'Active 10m ago',
      isGroup: true,
      avatarInitials: 'DB',
      unreadCount: 0,
      lastMessage: 'Anisul Islam: Please review normalization slides.',
      lastMessageTime: 'Yesterday',
      messages: [
        { id: 'dm1', senderName: 'Anisul Islam', senderInitials: 'AI', text: 'Guys, quiz syllabus is normal forms up to 3NF', time: '03:15 PM', isSelf: false },
        { id: 'dm2', senderName: 'Me', text: 'Got it, thanks', time: '03:20 PM', isSelf: true, status: 'read' },
        { id: 'dm3', senderName: 'Anisul Islam', senderInitials: 'AI', text: 'Please review normalization slides.', time: '05:00 PM', isSelf: false }
      ]
    },
    {
      id: 'g3',
      name: 'Compiler Design Lab Chat',
      subtitle: 'Active yesterday',
      isGroup: true,
      avatarInitials: 'CD',
      unreadCount: 0,
      lastMessage: 'Nusrat Jahan: Lab 1 parser code has been pushed',
      lastMessageTime: 'Thursday',
      messages: [
        { id: 'cm1', senderName: 'Nusrat Jahan', senderInitials: 'NJ', text: 'Lab 1 parser code has been pushed', time: '04:12 PM', isSelf: false }
      ]
    }
  ]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages, selectedChat?.id]);

  // Filter and sort sessions: Pinned always go first
  const filteredSessions = sessions
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'personal' ? !s.isGroup : s.isGroup;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || typedMessage;
    if (!text.trim() || !selectedChat) return;

    const newMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: 'Me',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      status: 'sent'
    };

    // Update active chat's messages
    const updatedMessages = [...selectedChat.messages, newMsg];
    
    // Update state sessions list
    const updatedSessions = sessions.map(s => {
      if (s.id === selectedChat.id) {
        return {
          ...s,
          lastMessage: `Me: ${newMsg.text}`,
          lastMessageTime: newMsg.time,
          messages: updatedMessages
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    setSelectedChat({
      ...selectedChat,
      lastMessage: `Me: ${newMsg.text}`,
      lastMessageTime: newMsg.time,
      messages: updatedMessages
    });
    
    if (!textToSend) {
      setTypedMessage('');
    }

    // Simulate response delay
    setTimeout(() => {
      setSessions(prevSessions => {
        return prevSessions.map(s => {
          if (s.id === selectedChat.id) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
            };
          }
          return s;
        });
      });

      setSelectedChat(prevSelected => {
        if (!prevSelected) return null;
        return {
          ...prevSelected,
          messages: prevSelected.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
        };
      });
    }, 1000);

    setTimeout(() => {
      setSessions(prevSessions => {
        return prevSessions.map(s => {
          if (s.id === selectedChat.id) {
            const replyMsg: Message = {
              id: Math.random().toString(36).substring(2, 9),
              senderName: s.isGroup ? 'Shah Nazib Mahmud' : s.name,
              senderInitials: s.avatarInitials,
              text: "Got it! Let me check this in a minute.",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSelf: false
            };
            return {
              ...s,
              lastMessage: s.isGroup ? `Shah Nazib Mahmud: ${replyMsg.text}` : replyMsg.text,
              lastMessageTime: replyMsg.time,
              messages: [
                ...s.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m),
                replyMsg
              ]
            };
          }
          return s;
        });
      });

      setSelectedChat(prevSelected => {
        if (!prevSelected) return null;
        const replyMsg: Message = {
          id: Math.random().toString(36).substring(2, 9),
          senderName: prevSelected.isGroup ? 'Shah Nazib Mahmud' : prevSelected.name,
          senderInitials: prevSelected.avatarInitials,
          text: "Got it! Let me check this in a minute.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false
        };
        return {
          ...prevSelected,
          lastMessage: prevSelected.isGroup ? `Shah Nazib Mahmud: ${replyMsg.text}` : replyMsg.text,
          lastMessageTime: replyMsg.time,
          messages: [
            ...prevSelected.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m),
            replyMsg
          ]
        };
      });
    }, 2500);
  };

  const sendMediaMessage = (mediaProps: Partial<Message>) => {
    if (!selectedChat) return;
    const newMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: 'Me',
      text: mediaProps.text || '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      status: 'sent',
      ...mediaProps
    };

    const updatedMessages = [...selectedChat.messages, newMsg];
    const updatedSessions = sessions.map(s => {
      if (s.id === selectedChat.id) {
        return {
          ...s,
          lastMessage: `Me: ${newMsg.text || 'Shared a media file'}`,
          lastMessageTime: newMsg.time,
          messages: updatedMessages
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    setSelectedChat({
      ...selectedChat,
      lastMessage: `Me: ${newMsg.text || 'Shared a media file'}`,
      lastMessageTime: newMsg.time,
      messages: updatedMessages
    });

    // Simulate auto-responses
    setTimeout(() => {
      setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === selectedChat.id) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
          };
        }
        return s;
      }));
      setSelectedChat(prevSelected => {
        if (!prevSelected) return null;
        return {
          ...prevSelected,
          messages: prevSelected.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
        };
      });
    }, 1000);

    setTimeout(() => {
      setSessions(prevSessions => prevSessions.map(s => {
        if (s.id === selectedChat.id) {
          const replyText = mediaProps.imageUrl 
            ? "Wow, this looks awesome! Thanks for sharing the photo." 
            : mediaProps.file 
            ? `Received the document: "${mediaProps.file.name}". Let me review it right now.` 
            : "Received the voice note. Listening to it now...";
          const replyMsg: Message = {
            id: Math.random().toString(36).substring(2, 9),
            senderName: s.isGroup ? 'Shah Nazib Mahmud' : s.name,
            senderInitials: s.avatarInitials,
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false
          };

          return {
            ...s,
            lastMessage: s.isGroup ? `Shah Nazib Mahmud: ${replyMsg.text}` : replyMsg.text,
            lastMessageTime: replyMsg.time,
            messages: [
              ...s.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m),
              replyMsg
            ]
          };
        }
        return s;
      }));

      setSelectedChat(prevSelected => {
        if (!prevSelected) return null;
        const replyText = mediaProps.imageUrl 
          ? "Wow, this looks awesome! Thanks for sharing the photo." 
          : mediaProps.file 
          ? `Received the document: "${mediaProps.file.name}". Let me review it right now.` 
          : "Received the voice note. Listening to it now...";
        const replyMsg: Message = {
          id: Math.random().toString(36).substring(2, 9),
          senderName: prevSelected.isGroup ? 'Shah Nazib Mahmud' : prevSelected.name,
          senderInitials: prevSelected.avatarInitials,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: false
        };
        return {
          ...prevSelected,
          lastMessage: prevSelected.isGroup ? `Shah Nazib Mahmud: ${replyMsg.text}` : replyMsg.text,
          lastMessageTime: replyMsg.time,
          messages: [
            ...prevSelected.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m),
            replyMsg
          ]
        };
      });
    }, 2500);
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      sendMediaMessage({ imageUrl: dataUrl, text: `Sent a photo: ${file.name}` });
    };
    reader.readAsDataURL(file);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const triggerFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKb = (file.size / 1024).toFixed(1);
    const formattedSize = Number(sizeInKb) > 1024 
      ? `${(Number(sizeInKb) / 1024).toFixed(1)} MB` 
      : `${sizeInKb} KB`;

    sendMediaMessage({
      text: `Attached file: ${file.name}`,
      file: {
        name: file.name,
        size: formattedSize,
        type: file.type || 'application/octet-stream'
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopVoiceRecording = (shouldSend: boolean) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (shouldSend) {
      const minutes = Math.floor(recordingSeconds / 60);
      const seconds = recordingSeconds % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      sendMediaMessage({
        text: `Voice note (${formattedDuration})`,
        isVoice: true,
        voiceDuration: formattedDuration
      });
    }

    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const formatRecordingTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    const newSess: ChatSession = {
      id: Math.random().toString(36).substring(2, 9),
      name: newChatName.trim(),
      subtitle: 'Active Now',
      isGroup: newChatType === 'group',
      avatarInitials: newChatName.trim().substring(0, 2).toUpperCase(),
      unreadCount: 0,
      lastMessage: 'No messages yet',
      lastMessageTime: 'Just now',
      messages: []
    };

    setSessions([newSess, ...sessions]);
    setNewChatName('');
    setIsNewChatModalOpen(false);
    setSelectedChat(newSess); // Open newly created chat instantly
  };

  const togglePinChat = (chatId: string) => {
    const updated = sessions.map(s => {
      if (s.id === chatId) {
        return { ...s, isPinned: !s.isPinned };
      }
      return s;
    });
    setSessions(updated);
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
    }
    setIsActionMenuOpen(false);
  };

  const toggleMuteChat = (chatId: string) => {
    const updated = sessions.map(s => {
      if (s.id === chatId) {
        return { ...s, isMuted: !s.isMuted };
      }
      return s;
    });
    setSessions(updated);
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
    }
    setIsActionMenuOpen(false);
  };

  const handleClearHistory = (chatId: string) => {
    const updated = sessions.map(s => {
      if (s.id === chatId) {
        return { ...s, messages: [], lastMessage: 'Chat history cleared', lastMessageTime: 'Now' };
      }
      return s;
    });
    setSessions(updated);
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? { ...prev, messages: [], lastMessage: 'Chat history cleared', lastMessageTime: 'Now' } : null);
    }
    setIsActionMenuOpen(false);
  };

  const askAcademicAI = () => {
    setAiLoading(true);
    setIsAiHelperOpen(true);
    
    // Simulate smart academic recommendations
    setTimeout(() => {
      const tips = [
        "📚 Study Sync: Group project submissions for Database Design are scheduled soon. Check your task calendar!",
        "💡 Lecture Sync: Double tap a chat message to save specific definitions directly to your personal study notepad.",
        "🎓 Campus Tip: You can scan routines from image files using our AI OCR Lecture Assistant!",
        "🤖 Peer Advice: Discussing Compiler Recitation? Coordinate with Shah Nazib in Section A group workspace right now.",
        "📊 Attendance Sync: You have maintained a highly secure 92% attendance rate this semester! Outstanding."
      ];
      setAiResponse(tips[Math.floor(Math.random() * tips.length)]);
      setAiLoading(false);
    }, 1100);
  };

  // Chats list sidebar renderer
  const renderChatSidebar = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 w-full md:w-80 lg:w-96 shrink-0 relative">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-50 dark:border-slate-800 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                Messenger
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Campus OS Tunnel</p>
            </div>
          </div>

          <button 
            onClick={() => setIsNewChatModalOpen(true)}
            className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Start new chat"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 dark:border-slate-700/80 focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/30 rounded-xl text-xs font-semibold text-slate-700 outline-hidden transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toggles (PERSONAL / GROUP) */}
        <div className="flex bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'group'
                ? 'bg-white dark:bg-slate-750 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat Session List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50/50 dark:divide-slate-800/40">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                setSelectedChat(session);
                setIsSidebarOpen(false); // Close sidebar on chat switch
              }}
              className={`w-full p-4 flex items-center gap-3.5 hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-all text-left relative border-l-4 ${
                selectedChat?.id === session.id 
                  ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-500' 
                  : 'border-transparent'
              }`}
            >
              {/* Avatar with Initials */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 relative border ${
                session.isGroup 
                  ? 'bg-indigo-50/60 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400' 
                  : 'bg-emerald-50/60 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
              }`}>
                {session.avatarInitials}
                
                {/* Live Online Badge */}
                {session.subtitle.toLowerCase().includes('active now') && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                )}
              </div>

              {/* Center Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate pr-2">
                    {session.name}
                  </h3>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                    {session.lastMessageTime}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400 truncate pr-6 font-medium">
                  {session.lastMessage}
                </p>
              </div>

              {/* Status badges (Pin/Mute/Unread) */}
              <div className="absolute right-4 bottom-4 flex items-center gap-1.5 shrink-0">
                {session.isMuted && <VolumeX className="w-3 h-3 text-slate-400" />}
                {session.isPinned && <Pin className="w-3 h-3 text-indigo-400 rotate-45" />}
                {session.unreadCount > 0 && (
                  <span className="w-4.5 h-4.5 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {session.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center h-48">
            <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-700 mb-2" />
            <h4 className="text-xs font-black text-slate-600 dark:text-slate-400">No chats found</h4>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">Initiate a connection using the "+" button.</p>
          </div>
        )}
      </div>

      {/* AI Assistant Callout at bottom of list */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <Sparkles className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <h5 className="text-[11px] font-black text-slate-700 dark:text-slate-300">Campus OS Advisor</h5>
            <p className="text-[9px] text-slate-400">Offline scheduler assistance</p>
          </div>
        </div>
        <button
          onClick={askAcademicAI}
          className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-colors"
        >
          Ask Bot
        </button>
      </div>
    </div>
  );

  // Active chat inbox workspace renderer
  const renderActiveChat = () => {
    if (!selectedChat) {
      return (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-slate-50/30 dark:bg-slate-900/10 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-center border border-indigo-100/30 dark:border-indigo-900/30 shadow-xs mb-4">
            <MessageSquare className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Select a Conversation</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
            Choose a private DM connection or shared group workspace from the sidebar to start secure academic communication.
          </p>
          
          <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-full border border-slate-200/40 text-[10px] font-semibold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-End Encrypted Tunnel • Locally Saved Logs</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-row bg-slate-50/20 dark:bg-slate-900/20 h-full relative overflow-hidden">
        {/* Active chat messages panel */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 relative">
          {/* Header */}
          <div className="bg-slate-50/80 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between gap-3 shrink-0 relative z-20 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back Button (Only visible on mobile) */}
              <button 
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850 rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs shrink-0 relative">
                {selectedChat.avatarInitials}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm animate-pulse" />
              </div>

              {/* Name & Subtitle */}
              <div className="min-w-0">
                <h2 className="font-extrabold text-xs text-slate-850 dark:text-slate-100 truncate leading-tight">
                  {selectedChat.name}
                </h2>
                <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active Now
                </span>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex items-center gap-1 shrink-0 text-slate-400 dark:text-slate-500">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                title="Conversation details"
              >
                <Info className="w-4.5 h-4.5" />
              </button>

              {/* Dropdown Menu wrapper */}
              <div className="relative" ref={actionMenuRef}>
                <button 
                  onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                  title="More actions"
                >
                  <MoreVertical className="w-4.5 h-4.5" />
                </button>

                {/* Dropdown Popover */}
                <AnimatePresence>
                  {isActionMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 text-xs text-slate-700 dark:text-slate-300 text-left"
                    >
                      <button
                        onClick={() => togglePinChat(selectedChat.id)}
                        className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                      >
                        <Pin className="w-3.5 h-3.5 text-indigo-500" />
                        {selectedChat.isPinned ? 'Unpin from top' : 'Pin conversation'}
                      </button>
                      <button
                        onClick={() => toggleMuteChat(selectedChat.id)}
                        className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-yellow-500" />
                        {selectedChat.isMuted ? 'Unmute alerts' : 'Mute notifications'}
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1.5" />
                      <button
                        onClick={() => handleClearHistory(selectedChat.id)}
                        className="w-full px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 flex items-center gap-2 font-bold cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear conversation logs
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Messages viewport container */}
          <div className="flex-1 bg-slate-50/30 dark:bg-slate-900/10 p-5 overflow-y-auto space-y-4 flex flex-col scrollbar-thin">
            {/* Encryption notice banner */}
            <div className="text-center py-3 space-y-1 select-none shrink-0">
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800/80 dark:text-slate-400 px-3 py-1 rounded-md">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Localized Campus OS Tunneling Enabled
              </span>
              <p className="text-[9px] text-slate-400 font-medium max-w-xs mx-auto">
                All media files and voice recording buffers reside on this sandbox environment.
              </p>
            </div>

            {selectedChat.messages.length > 0 ? (
              selectedChat.messages.map((msg, index) => {
                return (
                  <div 
                    key={msg.id || index}
                    className={`flex flex-col max-w-[85%] ${msg.isSelf ? 'self-end' : 'self-start'}`}
                  >
                    {/* Show user sender name for incoming group messages */}
                    {!msg.isSelf && selectedChat.isGroup && (
                      <span className="text-[10px] font-extrabold text-slate-400/80 mb-1 ml-3 select-none tracking-wider uppercase">
                        {msg.senderName}
                      </span>
                    )}

                    <div className="flex items-end gap-2">
                      {/* Avatar for incoming messages */}
                      {!msg.isSelf && (
                        <div className="w-6.5 h-6.5 rounded-lg bg-slate-150 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-[9px] font-extrabold text-slate-500 dark:text-slate-400 mr-0.5 select-none shrink-0 mb-3 uppercase">
                          {msg.senderInitials || msg.senderName.substring(0,2)}
                        </div>
                      )}

                      <div>
                        {/* Bubble */}
                        <div className={`p-3.5 px-4 rounded-[1.4rem] text-xs font-semibold relative ${
                          msg.isSelf 
                            ? 'bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-br-none shadow-sm' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-850 rounded-bl-none shadow-3xs'
                        }`}>
                          {msg.isVoice ? (
                            <div className="flex items-center gap-3 py-1">
                              <button className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isSelf ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                <Play className="w-4 h-4 fill-current" />
                              </button>
                              <div className="flex-1 min-w-[120px]">
                                {/* wave effect */}
                                <div className="flex items-end gap-1 h-6">
                                  {[4, 2, 6, 8, 5, 3, 7, 4, 6, 2, 5, 8, 3, 6, 4].map((h, i) => (
                                    <span 
                                      key={i} 
                                      className={`w-0.5 rounded-full transition-all ${
                                        msg.isSelf ? 'bg-white/55' : 'bg-slate-300 dark:bg-slate-600'
                                      }`}
                                      style={{ height: `${h * 2}px` }}
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] mt-1 block opacity-80 font-mono">{msg.voiceDuration || '0:05'}</span>
                              </div>
                            </div>
                          ) : msg.file ? (
                            /* document message */
                            <div className="flex items-center gap-3 py-1.5 max-w-xs text-left">
                              <div className={`p-2.5 rounded-xl shrink-0 ${msg.isSelf ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-755'}`}>
                                <FileText className="w-6.5 h-6.5 text-indigo-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-black truncate">{msg.file.name}</p>
                                <span className="text-[10px] opacity-80 block mt-0.5">{msg.file.size} • document</span>
                              </div>
                            </div>
                          ) : msg.imageUrl ? (
                            /* image message */
                            <div className="space-y-1.5 text-left">
                              <img 
                                src={msg.imageUrl} 
                                alt="Shared payload" 
                                className="rounded-xl max-w-full max-h-60 object-cover border border-black/5 dark:border-white/5"
                                referrerPolicy="no-referrer"
                              />
                              {msg.text && <p className="text-xs font-semibold mt-1 leading-relaxed">{msg.text}</p>}
                            </div>
                          ) : (
                            /* plain text message */
                            <p className="leading-relaxed whitespace-pre-line text-left">{msg.text}</p>
                          )}
                        </div>

                        {/* Status ticks + Time */}
                        <div className={`flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400 ${msg.isSelf ? 'justify-end pr-1' : 'pl-2'}`}>
                          <span>{msg.time}</span>
                          {msg.isSelf && (
                            <span className="shrink-0">
                              {msg.status === 'sent' && <Check className="w-3 h-3 text-slate-300" />}
                              {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-slate-300" />}
                              {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
                <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-700 mb-2" />
                <h4 className="text-xs font-bold text-slate-500">No message history</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1">Start chatting by typing a greeting or selecting a quick chip below.</p>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* Quick Action response chips */}
          {selectedChat.messages.length > 0 && (
            <div className="px-5 py-2 overflow-x-auto flex gap-1.5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/60 dark:border-slate-800/60 scrollbar-none scroll-smooth">
              {quickResponses.map((resText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(resText)}
                  className="py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/25 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full border border-slate-150 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-all shrink-0 cursor-pointer shadow-3xs"
                >
                  {resText}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0 relative z-10">
            <div className="flex items-center gap-0.5 shrink-0">
              <button 
                onClick={triggerCamera}
                title="Capture & send photo"
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 text-indigo-500" />
              </button>
              
              <button 
                onClick={isRecordingVoice ? () => stopVoiceRecording(true) : startVoiceRecording}
                title={isRecordingVoice ? "Stop and Send Voice Note" : "Record voice note"}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isRecordingVoice 
                    ? 'text-red-500 bg-red-50 dark:bg-red-950/20 animate-pulse' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Mic className={`w-5 h-5 ${isRecordingVoice ? 'text-red-500' : 'text-indigo-500'}`} />
              </button>

              <button 
                onClick={triggerFile}
                title="Attach local file/document"
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <Paperclip className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input 
              type="file" 
              ref={cameraInputRef} 
              onChange={handleCameraChange} 
              accept="image/*" 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />

            {isRecordingVoice ? (
              <div className="flex-1 flex items-center justify-between bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl px-4 py-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider font-mono">
                    Recording: {formatRecordingTime(recordingSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => stopVoiceRecording(false)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => stopVoiceRecording(true)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Send Note
                  </button>
                </div>
              </div>
            ) : (
              /* Text Area Input */
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1 text-slate-700 dark:text-slate-200 relative">
                <input 
                  type="text" 
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none outline-hidden py-2 text-xs font-semibold focus:ring-0 placeholder:text-slate-400"
                />
                
                {/* Emoji smile button wrapper with popover */}
                <div className="relative shrink-0" ref={emojiContainerRef}>
                  <button 
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    type="button"
                    title="Select Emojis"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700 ${isEmojiPickerOpen ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* Emoji Picker Popover */}
                  <AnimatePresence>
                    {isEmojiPickerOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 bottom-12 z-50 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2rem shadow-2xl p-3 w-56 flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-750">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick Emojis</span>
                          <button 
                            onClick={() => setIsEmojiPickerOpen(false)}
                            className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1 p-0.5">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleEmojiClick(emoji)}
                              className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button 
              onClick={() => handleSendMessage()}
              disabled={!typedMessage.trim() && !isRecordingVoice}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                typedMessage.trim() 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Info Sidebar panel (Group info / DM info) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? '100%' : '320px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`h-full bg-slate-50 dark:bg-slate-950 border-l border-slate-150 dark:border-slate-800/80 flex flex-col shrink-0 absolute right-0 top-0 z-30 md:relative`}
            >
              <div className="p-4 border-b border-slate-150 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Conversation Detail</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-150 dark:hover:bg-slate-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-slate-700 dark:text-slate-300">
                {/* Meta details */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400 flex items-center justify-center font-black text-lg shadow-sm mb-3">
                    {selectedChat.avatarInitials}
                  </div>
                  <h3 className="text-sm font-black text-slate-855 dark:text-white">{selectedChat.name}</h3>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-extrabold font-mono">
                    {selectedChat.isGroup ? 'Shared Group Workspace' : 'Secure Direct Line'}
                  </span>
                </div>

                {/* Academic Context / Info */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Connection properties</span>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4.5 space-y-3.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Format</span>
                      <p className="font-extrabold text-slate-755 dark:text-slate-200 mt-0.5">{selectedChat.isGroup ? 'Group Workgroup' : 'Direct Student Connection'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Mute notifications</span>
                      <p className="font-extrabold text-slate-755 dark:text-slate-200 mt-0.5">{selectedChat.isMuted ? 'Muted' : 'Sound Alerts Enabled'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Pinned chat status</span>
                      <p className="font-extrabold text-slate-755 dark:text-slate-200 mt-0.5">{selectedChat.isPinned ? 'Pinned to top' : 'Standard Priority'}</p>
                    </div>
                  </div>
                </div>

                {/* Mock Shared Documents list if present */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Attachments shared (3)</span>
                  <div className="space-y-2">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-2 text-xs">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-bold truncate">Lab-Task-01.pdf</p>
                        <span className="text-[9px] text-slate-400">1.2 MB • Jul 12</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-2 text-xs">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-bold truncate">Syllabus-Overview.pdf</p>
                        <span className="text-[9px] text-slate-400">450 KB • Jul 14</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div id="chats-view-root" className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-950/40 relative flex flex-col flex-1">
      
      {/* Background ambient decorative gradient */}
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-brand-primary/5 via-brand-secondary/3 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full p-2 md:p-4 z-10 flex-1 flex flex-col relative h-[calc(100vh-160px)]">
        
        {/* Core Workspace wrapper */}
        <div className="glass-card rounded-[2.2rem] border border-slate-200/50 dark:border-slate-800 shadow-2xl flex-1 flex overflow-hidden h-full">
          {isMobile ? (
            /* MOBILE SCREEN: Show sidebar OR active conversation full width */
            <AnimatePresence mode="wait">
              {!selectedChat ? (
                <motion.div 
                  key="mob-sidebar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col"
                >
                  {renderChatSidebar()}
                </motion.div>
              ) : (
                <motion.div 
                  key="mob-active"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="w-full h-full flex flex-col"
                >
                  {renderActiveChat()}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* DESKTOP SPLIT PANE: Both sidebar and active chat reside in grid together */
            <>
              {renderChatSidebar()}
              {renderActiveChat()}
            </>
          )}
        </div>

      </div>

      {/* MODAL: CREATE CHAT DIALOG */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewChatModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Dialog Card */}
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="glass-card rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-2xl relative w-full max-w-sm z-10 text-slate-800 dark:text-slate-200"
            >
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-primary" />
                Initialize Messenger
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-4">
                Launch a clean direct connection line with students or departments.
              </p>

              <form onSubmit={createNewChat} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Contact / Room Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="e.g. Golam Rabbi, 7th Sem Sect B" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Connection Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewChatType('personal')}
                      className={`py-2 px-3 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                        newChatType === 'personal'
                          ? 'bg-brand-primary/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                          : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Personal (DM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChatType('group')}
                      className={`py-2 px-3 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                        newChatType === 'group'
                          ? 'bg-brand-primary/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                          : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Group Workspace
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewChatModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl hover:bg-brand-primary/95 transition-colors cursor-pointer animate-none"
                  >
                    Open Connection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ACADEMIC AI RESPONSE DIALOG */}
      <AnimatePresence>
        {isAiHelperOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiHelperOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Dialog Card */}
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative w-full max-w-sm z-10 text-white text-left"
            >
              <button 
                onClick={() => setIsAiHelperOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-250 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                <h2 className="text-sm font-black font-mono tracking-wider uppercase text-sky-400">
                  Campus OS Advisor
                </h2>
              </div>

              {aiLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-sky-300 font-mono tracking-widest animate-pulse">
                    CALCULATING SCHEDULE ADVICE...
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-semibold leading-relaxed text-slate-300">
                    {aiResponse}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setIsAiHelperOpen(false)}
                      className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-mono font-black rounded-lg border border-sky-500/30 transition-colors cursor-pointer"
                    >
                      ACKNOWLEDGE
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
