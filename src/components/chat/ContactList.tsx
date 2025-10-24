import { useState } from 'react';
import { Contact } from '@/pages/Chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';
import { AddContactDialog } from './AddContactDialog';
import { cn } from '@/lib/utils';

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  onContactsUpdate: () => void;
  loading: boolean;
}

export const ContactList = ({
  contacts,
  selectedContact,
  onSelectContact,
  onContactsUpdate,
  loading,
}: ContactListProps) => {
  const [showAddContact, setShowAddContact] = useState(false);

  return (
    <div className="w-80 border-r bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b">
        <Button
          onClick={() => setShowAddContact(true)}
          className="w-full"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <UserPlus className="w-12 h-12 mb-3 opacity-50" />
            <p>No contacts yet</p>
            <p className="text-sm">Add a contact to start chatting</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={cn(
                "w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors border-b",
                selectedContact?.id === contact.id && "bg-accent"
              )}
            >
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {contact.profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left">
                <div className="font-semibold">{contact.profile.username}</div>
                {contact.profile.full_name && (
                  <div className="text-sm text-muted-foreground truncate">
                    {contact.profile.full_name}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <AddContactDialog
        open={showAddContact}
        onOpenChange={setShowAddContact}
        onContactAdded={(contact) => {
          onContactsUpdate();
          onSelectContact(contact);
        }}
      />
    </div>
  );
};
