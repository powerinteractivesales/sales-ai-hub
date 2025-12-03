import { Button } from '@/components/ui/button';
import { formatInDubaiTime } from '@/lib/timezone';
import { RefreshCw, LogOut, Bot } from 'lucide-react';
import { logout } from '@/lib/api';

interface DashboardHeaderProps {
  updatedAt: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ updatedAt, isRefreshing, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">AI Sales Agent</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Dashboard</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Last Updated */}
            {updatedAt && (
              <div className="hidden sm:block text-right">
                <div className="text-xs text-muted-foreground">Last updated</div>
                <div className="text-sm font-medium">
                  {formatInDubaiTime(updatedAt, 'MMM d, h:mm a')}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
