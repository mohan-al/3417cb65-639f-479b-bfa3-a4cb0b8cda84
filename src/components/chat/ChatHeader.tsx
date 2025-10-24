import { MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const ChatHeader = () => {
  const { signOut } = useAuth();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--gradient-primary)' }}>
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">ChatApp</h1>
        </div>
        
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};
