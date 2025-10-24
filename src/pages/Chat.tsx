import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ContactList } from '@/components/chat/ContactList';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatHeader } from '@/components/chat/ChatHeader';

export interface Contact {
  id: string;
  user_id: string;
  contact_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  profile: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  unreadCount?: number;
}

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      
      // Get accepted contacts (sent by user)
      const { data: acceptedSent, error: errorSent } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'accepted');

      // Get accepted contacts (received by user)
      const { data: acceptedReceived, error: errorReceived } = await supabase
        .from('contacts')
        .select('*')
        .eq('contact_id', user!.id)
        .eq('status', 'accepted');

      // Get pending requests (received by user)
      const { data: pendingData, error: errorPending } = await supabase
        .from('contacts')
        .select('*')
        .eq('contact_id', user!.id)
        .eq('status', 'pending');

      if (errorSent || errorReceived || errorPending) throw errorSent || errorReceived || errorPending;

      const allAcceptedContacts = [...(acceptedSent || []), ...(acceptedReceived || [])];
      
      if (allAcceptedContacts.length === 0) {
        setContacts([]);
        setPendingRequests([]);
        return;
      }

      // Get unique contact IDs
      const contactIds = allAcceptedContacts.map(c => 
        c.user_id === user!.id ? c.contact_id : c.user_id
      );
      const pendingIds = (pendingData || []).map(c => c.user_id);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', [...contactIds, ...pendingIds]);

      if (profilesError) throw profilesError;

      // Get unread counts for each contact
      const contactsWithUnread = await Promise.all(
        allAcceptedContacts.map(async (contact) => {
          const otherUserId = contact.user_id === user!.id ? contact.contact_id : contact.user_id;
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', user!.id)
            .is('read_at', null);

          return {
            ...contact,
            contact_id: otherUserId,
            profile: profilesData?.find(p => p.user_id === otherUserId) || {
              username: 'Unknown',
              full_name: null,
              avatar_url: null,
            },
            unreadCount: count || 0,
          };
        })
      );

      // Sort by unread count (descending)
      contactsWithUnread.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));

      // Process pending requests
      const pendingWithProfiles = (pendingData || []).map(contact => ({
        ...contact,
        profile: profilesData?.find(p => p.user_id === contact.user_id) || {
          username: 'Unknown',
          full_name: null,
          avatar_url: null,
        },
      }));

      setContacts(contactsWithUnread as any);
      setPendingRequests(pendingWithProfiles as any);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--gradient-chat)' }}>
      <ChatHeader />
      
      <div className="flex-1 flex overflow-hidden">
        <ContactList
          contacts={contacts}
          pendingRequests={pendingRequests}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          onContactsUpdate={fetchContacts}
          loading={loadingContacts}
        />
        
        <ChatMessages
          selectedContact={selectedContact}
          currentUserId={user.id}
          onMessageRead={fetchContacts}
        />
      </div>
    </div>
  );
};

export default Chat;
