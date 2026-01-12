import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingUser {
  odBCqt: string;
  name: string;
  isTyping: boolean;
}

export const useTypingIndicator = (
  channelName: string,
  odBCqt: string,
  userName: string
) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!channelName || !odBCqt) return;

    const channel = supabase.channel(`typing:${channelName}`, {
      config: {
        presence: {
          key: odBCqt,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence) => {
            if (presence.odBCqt !== odBCqt && presence.isTyping) {
              users.push({
                odBCqt: presence.odBCqt,
                name: presence.name,
                isTyping: presence.isTyping,
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            odBCqt,
            name: userName,
            isTyping: false,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [channelName, odBCqt, userName]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Track typing status
      await channelRef.current.track({
        odBCqt,
        name: userName,
        isTyping,
      });

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              odBCqt,
              name: userName,
              isTyping: false,
            });
          }
        }, 3000);
      }
    },
    [odBCqt, userName]
  );

  const startTyping = useCallback(() => {
    setTyping(true);
  }, [setTyping]);

  const stopTyping = useCallback(() => {
    setTyping(false);
  }, [setTyping]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
};
