import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Contact } from '@/pages/Chat';

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactAdded: (contact: Contact) => void;
}

export const AddContactDialog = ({ open, onOpenChange, onContactAdded }: AddContactDialogProps) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim()) return;

    try {
      setLoading(true);

      // Find user by username
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .eq('username', username.trim())
        .single();

      if (profileError || !profiles) {
        toast({
          title: "User not found",
          description: "No user found with that username.",
          variant: "destructive",
        });
        return;
      }

      if (profiles.user_id === user.id) {
        toast({
          title: "Invalid action",
          description: "You cannot add yourself as a contact.",
          variant: "destructive",
        });
        return;
      }

      // Check if contact already exists
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('contact_id', profiles.user_id)
        .single();

      if (existingContact) {
        toast({
          title: "Contact exists",
          description: "This contact is already in your list.",
          variant: "destructive",
        });
        return;
      }

      // Add contact
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_id: profiles.user_id,
        })
        .select()
        .single();

      if (contactError) throw contactError;

      toast({
        title: "Success!",
        description: `${username} has been added to your contacts.`,
      });

      // Create contact object with profile data
      const contactWithProfile: Contact = {
        ...newContact,
        profile: {
          username: profiles.username,
          full_name: profiles.full_name,
          avatar_url: profiles.avatar_url,
        },
      };

      onContactAdded(contactWithProfile);
      setUsername('');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Enter the username of the person you want to chat with
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
