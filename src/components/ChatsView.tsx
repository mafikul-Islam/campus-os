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
  StopCircle,
  Trash2
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

  // Popular Emojis
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', 
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', 
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', 
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', 
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', 
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', 
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', 
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', 
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', 
    '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', 
    '🤖', '🎃', '👋', '👍', '👎', '👊', '👌', '✌️', '🤝', '🙏',
    '❤️', '💖', '🔥', '✨', '🎉', '💯', '🚀', '📚', '🎓', '💻'
  ];

  // Close emoji picker on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
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
  }, [selectedChat?.messages]);

  // Filter sessions by search query & tab
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'personal' ? !s.isGroup : s.isGroup;
    return matchesSearch && matchesTab;
  });

  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedChat) return;

    const newMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      senderName: 'Me',
      text: typedMessage.trim(),
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
    setTypedMessage('');

    // Simulate response delay
    setTimeout(() => {
      // Simulate delivered status
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

      // Show delivery tick locally
      setSelectedChat(prevSelected => {
        if (!prevSelected) return null;
        return {
          ...prevSelected,
          messages: prevSelected.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
        };
      });
    }, 1000);

    setTimeout(() => {
      // Simulate read status and reply
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

  const askAcademicAI = () => {
    setAiLoading(true);
    setIsAiHelperOpen(true);
    
    // Simulate a smart academic response from AI Helper
    setTimeout(() => {
      const tips = [
        "📚 Tip: Group project submissions for Database Design are scheduled for July 15! Check your Calendar.",
        "💡 Pro tip: Double tap a message to bookmark crucial exam syllabus details.",
        "🎓 Campus OS Tip: You can scan hand-written routine images directly in the Calendar view using our AI OCR Lecture Assistant!",
        "🤖 AI Helper: AM Pritam and Shah Nazib are active in Section A group! Say hi to discuss the Compiler Recitation.",
        "📊 Campus OS: High attendance (92%) registered this week! Check your detailed class statistics on the Analytics tab."
      ];
      setAiResponse(tips[Math.floor(Math.random() * tips.length)]);
      setAiLoading(false);
    }, 1200);
  };

  return (
    <div id="chats-view-root" className="min-h-[calc(100vh-140px)] bg-slate-50 relative flex flex-col">
      
      {/* Background ambient decorative gradient */}
      <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-brand-primary/5 via-brand-secondary/3 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full p-4 md:p-6 z-10 flex-1 flex flex-col relative">
        
        <AnimatePresence mode="wait">
          {!selectedChat ? (
            /* ==================== PAGE 1: CHATS LIST VIEW ==================== */
            <motion.div 
              key="chat-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {onBack && (
                    <button 
                      onClick={onBack}
                      className="p-2 rounded-xl border border-slate-200 glass-card text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
                      title="Back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-500 shadow-xs">
                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      Chats
                    </h1>
                    <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">University Messenger</p>
                  </div>
                </div>

                {/* Profile Circle */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-extrabold text-xs text-brand-primary uppercase shadow-xs">
                    {profile.name.substring(0, 2)}
                  </div>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..." 
                  className="w-full pl-12 pr-4 py-3 glass-card border border-slate-200 focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/30 rounded-2xl text-xs font-bold text-slate-700 outline-hidden shadow-xs transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Toggles (PERSONAL / GROUP) */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                    activeTab === 'personal'
                      ? 'bg-brand-primary text-white scale-[1.02] shadow-md shadow-brand-primary/10'
                      : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setActiveTab('group')}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                    activeTab === 'group'
                      ? 'bg-brand-primary text-white scale-[1.02] shadow-md shadow-brand-primary/10'
                      : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  Group
                </button>
              </div>

              {/* Chat Session List */}
              <div className="flex-1 min-h-[300px]">
                {filteredSessions.length > 0 ? (
                  <div className="glass-card rounded-3xl border border-slate-100 divide-y divide-slate-50 shadow-xs overflow-hidden">
                    {filteredSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedChat(session)}
                        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-all text-left group"
                      >
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs border relative shrink-0 ${
                          session.isGroup 
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                            : 'bg-brand-secondary/5 border-brand-secondary/10 text-brand-secondary'
                        }`}>
                          {session.avatarInitials}
                          
                          {/* Live Status indicator */}
                          {session.subtitle.toLowerCase().includes('active now') && (
                            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500/20" />
                          )}
                        </div>

                        {/* Middle Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-extrabold text-sm text-slate-800 truncate group-hover:text-brand-primary transition-colors">
                              {session.name}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">
                              {session.lastMessageTime}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 truncate pr-4 font-medium">
                            {session.lastMessage}
                          </p>
                        </div>

                        {/* Unread dot count */}
                        {session.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-brand-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-brand-primary/20 animate-pulse">
                            {session.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* EMPTY STATE */
                  <div className="h-full min-h-[250px] flex flex-col items-center justify-center p-8 glass-card/80 border border-dashed border-slate-200 rounded-3xl text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100/80 flex items-center justify-center mb-3">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-black text-slate-700">
                      No {activeTab} chats found
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      {activeTab === 'personal' 
                        ? 'Tap the floating "+" button to initiate a secure direct message conversation with students or professors.' 
                        : 'Connect with study rooms, batches, or university departments to see them here.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Floating Academic AI Assistant "Ask me!" */}
              <div className="fixed bottom-24 right-6 z-30 flex flex-col items-end gap-2.5">
                <button 
                  onClick={askAcademicAI}
                  className="flex items-center gap-1 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white py-1 px-3 rounded-full text-[10px] font-black tracking-wider uppercase shadow-md shadow-sky-500/15 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow group-hover:rotate-12 transition-transform" />
                  Ask me!
                </button>
                <button 
                  onClick={askAcademicAI}
                  className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 text-white flex items-center justify-center shadow-2xl relative overflow-hidden active:scale-95 transition-all cursor-pointer hover:border-sky-500/50 glow-blue"
                >
                  {/* Subtle inner animated ring */}
                  <span className="absolute inset-0.5 rounded-full border border-sky-400/20 animate-pulse" />
                  <span className="text-xs font-black font-mono tracking-tight text-sky-400">OS</span>
                </button>
              </div>

              {/* Floating Action Button (FAB) */}
              <button 
                onClick={() => setIsNewChatModalOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-primary/25 active:scale-95 hover:scale-105 hover:shadow-2xl transition-all cursor-pointer z-20"
              >
                <Plus className="w-7 h-7" />
              </button>
            </motion.div>
          ) : (
            /* ==================== PAGE 2: ACTIVE CHAT INBOX VIEW ==================== */
            <motion.div 
              key="chat-inbox"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col glass-card rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden relative min-h-[500px]"
            >
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between gap-3 shrink-0 relative z-10">
                {/* Back & Avatar */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="p-1.5 hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0 relative">
                    {selectedChat.avatarInitials}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500/20 animate-pulse" />
                  </div>

                  {/* Name and subtitle */}
                  <div className="min-w-0">
                    <h2 className="font-extrabold text-sm text-slate-800 truncate leading-tight">
                      {selectedChat.name}
                    </h2>
                    <span className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Now
                    </span>
                  </div>
                </div>

                {/* Call & Action icons */}
                <div className="flex items-center gap-1 shrink-0 text-slate-500">
                  <button className="p-2 hover:bg-slate-100 rounded-xl hover:text-slate-800 transition-colors cursor-pointer">
                    <Phone className="w-4.5 h-4.5" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-xl hover:text-slate-800 transition-colors cursor-pointer">
                    <Video className="w-4.5 h-4.5" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-xl hover:text-slate-800 transition-colors cursor-pointer">
                    <MoreVertical className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 bg-slate-50/50 p-4 overflow-y-auto space-y-4 flex flex-col min-h-[300px]">
                
                {/* Chat intro banner */}
                <div className="text-center py-4 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Start of Encryption
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    This is your university group chat workspace. Direct communication logs are secured locally.
                  </p>
                </div>

                {selectedChat.messages.map((msg, index) => {
                  return (
                    <div 
                      key={msg.id || index}
                      className={`flex flex-col max-w-[80%] ${msg.isSelf ? 'self-end' : 'self-start'}`}
                    >
                      {/* Show user sender name for incoming group messages */}
                      {!msg.isSelf && selectedChat.isGroup && (
                        <span className="text-[10px] font-bold text-slate-400 mb-1 ml-2 select-none">
                          {msg.senderName}
                        </span>
                      )}

                      <div className="flex items-end gap-1.5">
                        {/* Incoming avatar icon placeholder */}
                        {!msg.isSelf && (
                          <div className="w-5.5 h-5.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 mr-1 select-none select-none shrink-0 mb-3 uppercase">
                            {msg.senderInitials || msg.senderName.substring(0,2)}
                          </div>
                        )}

                        <div>
                          {/* Chat bubble */}
                          <div className={`p-3.5 px-4 rounded-3xl text-sm font-semibold relative ${
                            msg.isSelf 
                              ? 'bg-emerald-500 text-white rounded-br-xs shadow-xs' 
                              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs shadow-2xs'
                          }`}>
                            {msg.isVoice ? (
                              <div className="flex items-center gap-3 py-1">
                                <button className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isSelf ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                  <Play className="w-4 h-4 fill-current" />
                                </button>
                                <div className="flex-1 min-w-[120px]">
                                  {/* Mock wave effect */}
                                  <div className="flex items-end gap-1 h-6">
                                    {[4, 2, 6, 8, 5, 3, 7, 4, 6, 2, 5, 8, 3, 6, 4].map((h, i) => (
                                      <span 
                                        key={i} 
                                        className={`w-0.5 rounded-full transition-all ${
                                          msg.isSelf ? 'glass-card' : 'bg-slate-400'
                                        }`}
                                        style={{ height: `${h * 2.2}px` }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] mt-1 block opacity-80 font-mono">{msg.voiceDuration || '0:05'}</span>
                                </div>
                              </div>
                            ) : msg.file ? (
                              /* If document/file message */
                              <div className="flex items-center gap-3 py-1 max-w-xs">
                                <div className={`p-2.5 rounded-xl shrink-0 ${msg.isSelf ? 'bg-white/20' : 'bg-slate-100'}`}>
                                  <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                  <p className="text-xs font-black truncate">{msg.file.name}</p>
                                  <span className="text-[10px] opacity-80 block">{msg.file.size} • document</span>
                                </div>
                              </div>
                            ) : msg.imageUrl ? (
                              /* If image message */
                              <div className="space-y-1.5">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="Uploaded attachment" 
                                  className="rounded-2xl max-w-xs max-h-60 object-cover border border-black/5"
                                  referrerPolicy="no-referrer"
                                />
                                {msg.text && <p className="text-xs font-semibold leading-relaxed mt-1 text-left">{msg.text}</p>}
                              </div>
                            ) : (
                              /* Plain text message */
                              <p className="leading-relaxed whitespace-pre-line text-left">{msg.text}</p>
                            )}
                          </div>

                          {/* Info Footer (Time + Ticks) */}
                          <div className={`flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400 ${msg.isSelf ? 'justify-end pr-1' : 'pl-2'}`}>
                            <span>{msg.time}</span>
                            {msg.isSelf && (
                              <span className="shrink-0">
                                {msg.status === 'sent' && <Check className="w-3 h-3 text-slate-300" />}
                                {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-slate-300" />}
                                {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messageEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={triggerCamera}
                    title="Camera: Share actual image file"
                    className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    <Camera className="w-5 h-5 text-emerald-600" />
                  </button>
                  
                  <button 
                    onClick={isRecordingVoice ? () => stopVoiceRecording(true) : startVoiceRecording}
                    title={isRecordingVoice ? "Stop & Send voice note" : "Voice Note: Record message"}
                    className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                      isRecordingVoice 
                        ? 'text-red-500 bg-red-50 animate-pulse' 
                        : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <Mic className={`w-5 h-5 ${isRecordingVoice ? 'text-red-500 animate-bounce' : 'text-emerald-600'}`} />
                  </button>

                  <button 
                    onClick={triggerFile}
                    title="Attach actual PDF/Doc/Image file"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shrink-0"
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
                  <div className="flex-1 flex items-center justify-between bg-red-50/50 border border-red-100 rounded-2xl px-4 py-2 text-slate-700 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-black text-red-600 uppercase tracking-widest font-mono">
                        Recording... {formatRecordingTime(recordingSeconds)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => stopVoiceRecording(false)}
                        title="Cancel recording"
                        className="p-1 hover:bg-red-100/50 text-red-500 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => stopVoiceRecording(true)}
                        title="Send recording"
                        className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Text Area Input */
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1 text-slate-700 relative">
                    <input 
                      type="text" 
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Message" 
                      className="flex-1 bg-transparent border-none outline-hidden py-2 text-xs font-semibold focus:ring-0 placeholder:text-slate-400"
                    />
                    
                    {/* Emoji smile button wrapper with popover */}
                    <div className="relative shrink-0" ref={emojiContainerRef}>
                      <button 
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        type="button"
                        title="Select Emojis"
                        className={`p-1.5 rounded-lg transition-all cursor-pointer hover:bg-slate-200/50 ${isEmojiPickerOpen ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-slate-600'}`}
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
                            className="absolute right-0 bottom-12 z-50 glass-card border border-slate-200 rounded-3xl shadow-2xl p-4 w-72 h-64 flex flex-col"
                          >
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick Emojis</span>
                              <button 
                                onClick={() => setIsEmojiPickerOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-1.5 p-0.5 scrollbar-thin">
                              {emojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleEmojiClick(emoji)}
                                  className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
                  onClick={handleSendMessage}
                  disabled={!typedMessage.trim() && !isRecordingVoice}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    typedMessage.trim() 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:scale-105' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              className="glass-card rounded-3xl border border-slate-200/80 p-6 shadow-2xl relative w-full max-w-sm z-10 text-slate-800"
            >
              <button 
                onClick={() => setIsNewChatModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-brand-primary outline-hidden"
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
                          ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                          : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      Personal (DM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChatType('group')}
                      className={`py-2 px-3 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                        newChatType === 'group'
                          ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                          : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
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
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl hover:bg-brand-primary/95 transition-colors cursor-pointer"
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
              className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative w-full max-w-sm z-10 text-white"
            >
              <button 
                onClick={() => setIsAiHelperOpen(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                <h2 className="text-sm font-black font-mono tracking-wider uppercase text-sky-400">
                  Campus OS Helper
                </h2>
              </div>

              {aiLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-sky-300 font-mono tracking-widest animate-pulse">
                    GENERATING ADVICE...
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-bold leading-relaxed text-slate-300">
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
