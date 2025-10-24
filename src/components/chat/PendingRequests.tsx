import { Contact } from '@/pages/Chat';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PendingRequestsProps {
  requests: Contact[];
  onUpdate: () => void;
}

export const PendingRequests = ({ requests, onUpdate }: PendingRequestsProps) => {
  const handleAccept = async (request: Contact) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'accepted' })
        .eq('id', request.id);

      if (error) throw error;

      toast.success(`Accepted request from ${request.profile.username}`);
      onUpdate();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (request: Contact) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', request.id);

      if (error) throw error;

      toast.success(`Rejected request from ${request.profile.username}`);
      onUpdate();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No pending requests
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-accent/20 border"
        >
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {request.profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="font-semibold">{request.profile.username}</div>
            {request.profile.full_name && (
              <div className="text-sm text-muted-foreground">
                {request.profile.full_name}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleAccept(request)}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(request)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
