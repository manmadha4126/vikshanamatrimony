import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, ArrowLeft, Loader2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
  profile_id: string | null;
  user_id: string | null;
}

interface Conversation {
  userId: string;
  profile: Profile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface MessagesSectionProps {
  userId: string;
  profileId: string;
  initialRecipient?: {
    recipientUserId: string;
    recipientProfileId: string;
    recipientName: string;
  };
}

const MessagesSection = ({ userId, profileId, initialRecipient }: MessagesSectionProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch accepted interests to get conversation partners
  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Get accepted interests where user is either sender or receiver
      const { data: sentInterests, error: sentError } = await supabase
        .from('interests')
        .select('to_profile_id')
        .eq('from_user_id', userId)
        .eq('status', 'accepted');

      const { data: receivedInterests, error: receivedError } = await supabase
        .from('interests')
        .select('from_user_id')
        .eq('to_profile_id', profileId)
        .eq('status', 'accepted');

      if (sentError || receivedError) throw sentError || receivedError;

      // Get profile IDs and user IDs for all accepted connections
      const partnerProfileIds = sentInterests?.map(i => i.to_profile_id) || [];
      const partnerUserIds = receivedInterests?.map(i => i.from_user_id) || [];

      // Fetch profiles for sent interests (using profile id)
      let allProfiles: Profile[] = [];
      
      if (partnerProfileIds.length > 0) {
        const { data: sentProfiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url, profile_id, user_id')
          .in('id', partnerProfileIds);
        if (sentProfiles) allProfiles = [...allProfiles, ...sentProfiles];
      }

      if (partnerUserIds.length > 0) {
        const { data: receivedProfiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url, profile_id, user_id')
          .in('user_id', partnerUserIds);
        if (receivedProfiles) {
          // Avoid duplicates
          receivedProfiles.forEach(p => {
            if (!allProfiles.find(existing => existing.id === p.id)) {
              allProfiles.push(p);
            }
          });
        }
      }

      // Get last messages and unread counts for each conversation
      const conversationsData: Conversation[] = [];
      
      for (const profile of allProfiles) {
        if (!profile.user_id) continue;
        
        // Get last message
        const { data: lastMessages } = await supabase
          .from('messages')
          .select('*')
          .or(`and(from_user_id.eq.${userId},to_user_id.eq.${profile.user_id}),and(from_user_id.eq.${profile.user_id},to_user_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('from_user_id', profile.user_id)
          .eq('to_user_id', userId)
          .eq('is_read', false);

        conversationsData.push({
          userId: profile.user_id,
          profile,
          lastMessage: lastMessages?.[0]?.content || 'Start a conversation',
          lastMessageTime: lastMessages?.[0]?.created_at || '',
          unreadCount: count || 0,
        });
      }

      // Sort by last message time
      conversationsData.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (partnerUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_user_id.eq.${userId},to_user_id.eq.${partnerUserId}),and(from_user_id.eq.${partnerUserId},to_user_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('from_user_id', partnerUserId)
        .eq('to_user_id', userId)
        .eq('is_read', false);

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          from_user_id: userId,
          to_user_id: selectedConversation.userId,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(selectedConversation.userId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userId, profileId]);

  // Handle initial recipient from interest section
  useEffect(() => {
    if (initialRecipient && conversations.length > 0) {
      const existingConv = conversations.find(c => c.userId === initialRecipient.recipientUserId);
      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Create a temporary conversation entry for new chats
        const tempConversation: Conversation = {
          userId: initialRecipient.recipientUserId,
          profile: {
            id: initialRecipient.recipientProfileId,
            name: initialRecipient.recipientName,
            photo_url: null,
            profile_id: null,
            user_id: initialRecipient.recipientUserId,
          },
          lastMessage: 'Start a conversation',
          lastMessageTime: '',
          unreadCount: 0,
        };
        setSelectedConversation(tempConversation);
      }
    }
  }, [initialRecipient, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${userId}`,
        },
        (payload) => {
          if (selectedConversation && payload.new.from_user_id === selectedConversation.userId) {
            setMessages(prev => [...prev, payload.new as Message]);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, selectedConversation]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Chat View
  if (selectedConversation) {
    return (
      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.profile.photo_url || ''} />
              <AvatarFallback>{getInitials(selectedConversation.profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{selectedConversation.profile.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedConversation.profile.profile_id}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-5rem)] p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => {
                const isOwn = message.from_user_id === userId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={sendingMessage || !newMessage.trim()}>
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Conversations List
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No conversations yet</h3>
            <p className="text-muted-foreground text-sm">
              Once you have accepted interests, you can start chatting here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedConversation(conv)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.profile.photo_url || ''} />
                  <AvatarFallback>{getInitials(conv.profile.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{conv.profile.name}</h4>
                    {conv.lastMessageTime && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {conv.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagesSection;
