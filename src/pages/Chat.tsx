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
      
      // First get contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user!.id);

      if (contactsError) throw contactsError;

      if (!contactsData || contactsData.length === 0) {
        setContacts([]);
        return;
      }

      // Then get profiles for those contacts
      const contactIds = contactsData.map(c => c.contact_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', contactIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const contactsWithProfiles = contactsData.map(contact => ({
        ...contact,
        profile: profilesData?.find(p => p.user_id === contact.contact_id) || {
          username: 'Unknown',
          full_name: null,
          avatar_url: null,
        }
      }));

      setContacts(contactsWithProfiles as any);
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
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          onContactsUpdate={fetchContacts}
          loading={loadingContacts}
        />
        
        <ChatMessages
          selectedContact={selectedContact}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
};

export default Chat;
