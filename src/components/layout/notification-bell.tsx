'use client';

import * as React from 'react';
import { Bell, Check, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { 
  getRecentNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '@/app/(app)/notifications/actions';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);

  // Fetch notifications on mount and when dropdown opens
  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    const result = await getRecentNotifications();
    if (result.success && result.data) {
      setNotifications(result.data);
    }
    setIsLoading(false);
  }, []);

  // Set up polling string for live updates every 30s
  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string, url?: string | null) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    
    // Background Server Update
    await markNotificationAsRead(id);
    
    // Navigate if there's a link
    if (url) {
      setIsOpen(false);
      router.push(url);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    
    // Background Server Update
    await markAllNotificationsAsRead();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Immediate optimistic UI delete
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Background Server Update
    const result = await deleteNotification(id);
    if (result?.error) {
       // Revert if it fails
       fetchNotifications();
    }
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Immediate optimistic UI delete
    setNotifications([]);
    
    // Background Server Update
    const result = await deleteAllNotifications();
    if (result?.error) {
       // Revert if it fails
       fetchNotifications();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchNotifications(); // Refresh on open
    }}>
      <DropdownMenuTrigger className="relative shrink-0 rounded-full text-muted-foreground hover:text-foreground inline-flex items-center justify-center h-9 w-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 cursor-default">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between p-2">
            <DropdownMenuLabel className="font-semibold text-base py-0">Notifications</DropdownMenuLabel>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto py-1 px-2 text-xs text-primary hover:text-primary">
                  <Check className="mr-1 h-3 w-3" /> Mark read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-auto py-1 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-1 h-3 w-3" /> Clear All
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          {isLoading && notifications.length === 0 ? (
             <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
               <Loader2 className="h-5 w-5 animate-spin" />
             </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center text-sm text-muted-foreground space-y-2">
              <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p>You have no notifications yet.</p>
            </div>
          ) : (
             <div className="flex flex-col">
               {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleMarkAsRead(notif.id, notif.link_url)}
                    className={`group flex flex-col gap-1 p-3 text-sm transition-colors hover:bg-muted cursor-pointer relative pr-10 ${notif.is_read ? 'opacity-60' : 'bg-primary/5 border-l-2 border-primary'}`}
                  >
                     <div className="flex justify-between items-start">
                        <span className="font-semibold px-0">{notif.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                           {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>
                     </div>
                     <p className="text-muted-foreground line-clamp-2 leading-snug">{notif.message}</p>
                     
                     {/* Individual Delete Button - shows on hover */}
                     <span 
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                        title="Delete notification"
                     >
                       <Trash2 className="h-4 w-4" />
                     </span>
                  </div>
               ))}
             </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
