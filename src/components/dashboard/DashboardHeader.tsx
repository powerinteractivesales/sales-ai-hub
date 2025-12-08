import { Button } from '@/components/ui/button';
import { formatInDubaiTime } from '@/lib/timezone';
import { RefreshCw, LogOut } from 'lucide-react';
import { logout } from '@/lib/api';

interface DashboardHeaderProps {
  updatedAt: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ updatedAt, isRefreshing, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Sales Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Last Updated */}
            {updatedAt && (
              <div className="hidden md:block text-right mr-2">
                <span className="text-xs text-slate-400">
                  {formatInDubaiTime(updatedAt, 'h:mm a')} GST
                </span>
              </div>
            )}

            {/* Refresh Button */}
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing' : 'Refresh'}</span>
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
