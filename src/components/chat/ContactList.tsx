import { useState } from 'react';
import { Contact } from '@/pages/Chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users } from 'lucide-react';
import { AddContactDialog } from './AddContactDialog';
import { PendingRequests } from './PendingRequests';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ContactListProps {
  contacts: Contact[];
  pendingRequests: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  onContactsUpdate: () => void;
  loading: boolean;
}

export const ContactList = ({
  contacts,
  pendingRequests,
  selectedContact,
  onSelectContact,
  onContactsUpdate,
  loading,
}: ContactListProps) => {
  const [showAddContact, setShowAddContact] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);

  return (
    <div className="w-80 border-r bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b space-y-2">
        <Button
          onClick={() => setShowAddContact(true)}
          className="w-full"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
        
        {pendingRequests.length > 0 && (
          <Button
            onClick={() => setShowPendingRequests(true)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Pending Requests
            <Badge variant="default" className="ml-2">
              {pendingRequests.length}
            </Badge>
          </Button>
        )}
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
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{contact.profile.username}</div>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
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
        onContactAdded={() => {
          onContactsUpdate();
        }}
      />

      <Sheet open={showPendingRequests} onOpenChange={setShowPendingRequests}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Pending Requests</SheetTitle>
            <SheetDescription>
              Accept or reject contact requests
            </SheetDescription>
          </SheetHeader>
          <PendingRequests 
            requests={pendingRequests} 
            onUpdate={() => {
              onContactsUpdate();
              setShowPendingRequests(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
