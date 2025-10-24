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
  profile: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
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
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          profile:profiles!contacts_contact_id_fkey(username, full_name, avatar_url)
        `)
        .eq('user_id', user!.id);

      if (error) throw error;

      setContacts(data as any || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  if (loading) {
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
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          onContactsUpdate={fetchContacts}
          loading={loadingContacts}
        />
        
        <ChatMessages
          selectedContact={selectedContact}
          currentUserId={user!.id}
        />
      </div>
    </div>
  );
};

export default Chat;
