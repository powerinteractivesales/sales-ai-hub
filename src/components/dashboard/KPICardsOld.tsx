import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DashboardSummary } from '@/types/dashboard';
import { Users, Clock, TrendingUp, AlertCircle, MessageCircle, Target, XCircle, Award } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Top Row - Main Metrics */}
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
              {summary.by_lead_source?.Meta || 0} Meta · {summary.by_lead_source?.Website || 0} Website
            </p>
          </CardContent>
        </Card>

        {/* Hot + Qualified Leads */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {(summary.hot_leads_count || 0) + (summary.qualified_leads_count || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.hot_leads_count || 0} Hot · {summary.qualified_leads_count || 0} Qualified
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.conversion_rate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              To Hot/Qualified stage
            </p>
          </CardContent>
        </Card>

        {/* Response Rate */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{summary.response_rate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.total_leads_with_replies || 0} of {summary.total_leads} replied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Time-based & Quality Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Follow-ups Due */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Follow-ups Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {summary.followups_due_now}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{summary.followups_due_this_week} this week
            </p>
          </CardContent>
        </Card>

        {/* New Leads 24h */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New (24h)</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.new_leads_last_24h || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        {/* New Leads 7d */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New (7d)</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.new_leads_last_7_days || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        {/* New Leads 30d */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New (30d)</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.new_leads_last_30_days || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Third Row - Lead Quality Scores & Stage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lead Quality Scores (Meta only) */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lead Quality Scores
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-bold">{summary.avg_lead_score || 0}</div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.avg_persona_fit || 0}</div>
                <p className="text-xs text-muted-foreground">Persona Fit</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.avg_activation_fit || 0}</div>
                <p className="text-xs text-muted-foreground">Activation</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.avg_intent_score || 0}</div>
                <p className="text-xs text-muted-foreground">Intent</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {summary.total_meta_leads || 0} Meta leads
            </p>
          </CardContent>
        </Card>

        {/* By Stage Distribution */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              By Stage
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.by_master_status).map(([status, count]) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className={`text-base font-semibold px-3 py-1 ${statusColors[status] || 'bg-secondary text-secondary-foreground'}`}
                >
                  {status}: {count}
                </Badge>
              ))}
              {Object.keys(summary.by_master_status).length === 0 && (
                <span className="text-sm text-muted-foreground">No data</span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-600" />
                <span>{summary.dead_leads_count || 0} Dead ({summary.dead_lead_rate || 0}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
