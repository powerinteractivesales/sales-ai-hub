import { Card, CardContent } from '@/components/ui/card';
import type { DashboardSummary } from '@/types/dashboard';
import {
  Users, TrendingUp, MessageCircle, Target,
  XCircle, Award, BarChart3, ArrowUpRight, ArrowDownRight, Globe
} from 'lucide-react';

interface KPICardsProps {
  summary: DashboardSummary;
}

// Modern minimal metric card
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'default',
  trend
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  accent?: 'default' | 'success' | 'warning' | 'danger';
  trend?: 'up' | 'down';
}) {
  const accentColors = {
    default: 'text-slate-600',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-rose-600',
  };

  return (
    <Card className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${accentColors[accent]} opacity-70`} />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</h3>
              {trend && (
                <span className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity card - simpler, cleaner
function ActivityCard({
  value,
  label,
  sublabel,
  urgent = false
}: {
  value: number;
  label: string;
  sublabel?: string;
  urgent?: boolean;
}) {
  return (
    <Card className={`border bg-white dark:bg-slate-950 transition-colors duration-200 ${
      urgent
        ? 'border-rose-200 dark:border-rose-900/50'
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      <CardContent className="p-4">
        <div className={`text-2xl font-semibold mb-1 ${urgent ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
          {value}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        {sublabel && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function KPICards({ summary }: KPICardsProps) {
  // Normalize master_status by stripping " - Assigned" suffix and combining counts
  const normalizedStatusCounts: Record<string, number> = {};
  Object.entries(summary.by_master_status).forEach(([status, count]) => {
    let baseStatus = status.replace(/ - Assigned$/, '');
    // Handle "Partially Dead - Assigned" → "Partially Dead Lead"
    if (baseStatus === 'Partially Dead') {
      baseStatus = 'Partially Dead Lead';
    }
    normalizedStatusCounts[baseStatus] = (normalizedStatusCounts[baseStatus] || 0) + count;
  });

  const pipelineData = Object.entries(normalizedStatusCounts)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = Math.max(...pipelineData.map(([, count]) => count), 1);

  return (
    <div className="space-y-8">
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pipeline"
          value={summary.total_leads}
          subtitle={`${summary.by_lead_source?.Meta || 0} Meta · ${summary.by_lead_source?.Website || 0} Web`}
          icon={Users}
        />

        <MetricCard
          title="Qualified Leads"
          value={summary.qualified_leads_count || 0}
          subtitle="Ready to convert"
          icon={Target}
          accent="warning"
          trend={(summary.qualified_leads_count || 0) > 0 ? 'up' : undefined}
        />

        <MetricCard
          title="Conversion Rate"
          value={`${summary.conversion_rate || 0}%`}
          subtitle="To hot/qualified stage"
          icon={TrendingUp}
          accent="success"
          trend={summary.conversion_rate > 5 ? 'up' : undefined}
        />

        <MetricCard
          title="Response Rate"
          value={`${summary.response_rate || 0}%`}
          subtitle={`${summary.total_leads_with_replies || 0} of ${summary.total_leads} replied`}
          icon={MessageCircle}
        />
      </div>

      {/* Activity Row */}
      <div>
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Activity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ActivityCard
            value={summary.followups_due_now || 0}
            label="Due now"
            sublabel={`+${summary.followups_due_this_week || 0} this week`}
            urgent={(summary.followups_due_now || 0) > 0}
          />
          <ActivityCard
            value={summary.new_leads_last_24h || 0}
            label="New today"
          />
          <ActivityCard
            value={summary.new_leads_last_7_days || 0}
            label="Last 7 days"
          />
          <ActivityCard
            value={summary.new_leads_last_30_days || 0}
            label="Last 30 days"
          />
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Quality Scores */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400" />
                <h3 className="font-medium text-slate-900 dark:text-slate-100">Lead Quality</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {summary.total_meta_leads || 0} Meta leads
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'Overall', value: summary.avg_lead_score || 0 },
                { label: 'Persona Fit', value: summary.avg_persona_fit || 0 },
                { label: 'Activation', value: summary.avg_activation_fit || 0 },
                { label: 'Intent', value: summary.avg_intent_score || 0 },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{metric.label}</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{metric.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-500"
                      style={{ width: `${(metric.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Pipeline Distribution</h3>
            </div>

            <div className="space-y-3">
              {pipelineData.map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-28 truncate">{status}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-8 text-right">{count}</span>
                </div>
              ))}

              {pipelineData.length === 0 && (
                <div className="text-center py-6 text-slate-400">No data available</div>
              )}

              {/* Dead leads with rate */}
              <div className="flex items-center gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 w-28">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Dead</span>
                </div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 dark:bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${((summary.dead_leads_count || 0) / maxCount) * 100}%` }}
                  />
                </div>
                <div className="flex items-baseline gap-1 w-20 justify-end">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {summary.dead_leads_count || 0}
                  </span>
                  <span className="text-xs text-rose-500">
                    ({summary.dead_lead_rate || 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Country Distribution */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-slate-400" />
              <h3 className="font-medium text-slate-900 dark:text-slate-100">Regional Distribution</h3>
            </div>

            <div className="space-y-3">
              {(() => {
                const countryData = Object.entries(summary.by_country || {})
                  .filter(([country]) => country && country !== 'Unknown')
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6);
                const maxCountryCount = Math.max(...countryData.map(([, count]) => count), 1);

                return countryData.length > 0 ? (
                  countryData.map(([country, count]) => (
                    <div key={country} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-20 truncate">{country}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 dark:bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxCountryCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-8 text-right">{count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400">No data available</div>
                );
              })()}

              {/* Unknown count if exists */}
              {(summary.by_country?.Unknown || 0) > 0 && (
                <div className="flex items-center gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-400 dark:text-slate-500 w-20">Unknown</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-300 dark:bg-slate-600 rounded-full transition-all duration-500"
                      style={{ width: `${((summary.by_country?.Unknown || 0) / Math.max(...Object.values(summary.by_country || {}), 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-8 text-right">
                    {summary.by_country?.Unknown || 0}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
