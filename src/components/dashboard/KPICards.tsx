import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DashboardSummary } from '@/types/dashboard';
import { Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface KPICardsProps {
  summary: DashboardSummary;
}

const statusColors: Record<string, string> = {
  'Warm Lead': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Cold Lead': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  'Qualified Lead': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Hot Lead': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function KPICards({ summary }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Leads */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.total_leads}</div>
          <p className="text-xs text-muted-foreground mt-1">
            In pipeline
          </p>
        </CardContent>
      </Card>

      {/* By Master Status */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">By Stage</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(summary.by_master_status).map(([status, count]) => (
              <Badge 
                key={status} 
                variant="secondary"
                className={statusColors[status] || 'bg-secondary text-secondary-foreground'}
              >
                {status}: {count}
              </Badge>
            ))}
            {Object.keys(summary.by_master_status).length === 0 && (
              <span className="text-sm text-muted-foreground">No data</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Follow-ups Due */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Follow-ups Due</CardTitle>
          <AlertCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {summary.followups_due_now}
            {summary.followups_due_today > 0 && (
              <span className="text-lg font-normal text-muted-foreground ml-2">
                (+{summary.followups_due_today} today)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requiring attention
          </p>
        </CardContent>
      </Card>

      {/* New Leads */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">New (24h)</CardTitle>
          <Clock className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{summary.new_leads_last_24h}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
