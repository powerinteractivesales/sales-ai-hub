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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <img
              src="https://i.ibb.co/hPk11y5/power-logo.png"
              alt="Power Interactive"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block h-6 w-px bg-slate-600" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <h1 className="text-lg font-semibold text-white">
                  Sales Dashboard
                </h1>
                <span className="text-xs text-slate-400 sm:hidden">Powered by The Queen</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-xs font-medium text-amber-300">
                  <span>👑</span>
                  The Queen
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Last Updated */}
            {updatedAt && (
              <div className="hidden md:block text-right mr-2">
                <span className="text-xs text-slate-300">
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
              className="gap-2 border-slate-600 text-white hover:bg-slate-700 hover:text-white bg-transparent"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing' : 'Refresh'}</span>
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
