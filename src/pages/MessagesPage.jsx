import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Search } from 'lucide-react';
import { messagesService } from '../services/jobs.service';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    messagesService.getConversations()
      .then(({ data }) => setConversations(data.data.conversations))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    messagesService.getMessages(activeConv._id)
      .then(({ data }) => setMessages(data.data.messages))
      .catch(() => toast.error('Failed to load messages'));
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await messagesService.send(activeConv._id, { content: text.trim() });
      setMessages(prev => [...prev, data.data.message]);
      setText('');
      setConversations(prev => prev.map(c =>
        c._id === activeConv._id ? { ...c, lastMessage: data.data.message, lastMessageAt: new Date() } : c
      ));
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const getOtherParticipant = (conv) =>
    conv.participants?.find(p => p._id !== user?._id) || conv.participants?.[0];

  const filtered = conversations.filter(c => {
    const other = getOtherParticipant(c);
    return other?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <LoadingSpinner center size="lg" text="Loading messages..." />;

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="input pl-9 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No conversations yet</p>
            </div>
          ) : (
            filtered.map(conv => {
              const other = getOtherParticipant(conv);
              const isActive = activeConv?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 ${isActive ? 'bg-primary-50' : ''}`}
                >
                  <Avatar src={other?.avatar} name={other?.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-700' : 'text-slate-900'}`}>
                      {other?.fullName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3">
            <Avatar src={getOtherParticipant(activeConv)?.avatar} name={getOtherParticipant(activeConv)?.fullName} size="sm" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">{getOtherParticipant(activeConv)?.fullName}</p>
              <p className="text-xs text-slate-400 capitalize">{getOtherParticipant(activeConv)?.role?.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-200 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="input flex-1 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <MessageSquare className="w-14 h-14 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">Your Messages</h3>
          <p className="text-sm text-slate-400 max-w-xs">Select a conversation to start chatting, or wait for employers to reach out.</p>
        </div>
      )}
    </div>
  );
}
