import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssignmentDropdown } from './AssignmentDropdown';
import type { LeadRow } from '@/types/dashboard';
import { formatInDubaiTime } from '@/lib/timezone';
import { cn } from '@/lib/utils';
import { UserCheck } from 'lucide-react';

interface MobileLeadCardProps {
  lead: LeadRow;
  isSelected: boolean;
  onClick: () => void;
}

const masterStatusColors: Record<string, string> = {
  'Warm Lead': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Cold Lead': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  'Qualified Lead': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Hot Lead': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Dead Lead': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  'Partially Dead Lead': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Validate Lead': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  'Dead Lead - Assigned': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  'Partially Dead - Assigned': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Validate Lead - Assigned': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  'Qualified Lead - Assigned': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

// Helper to get display status and check if assigned
function getStatusDisplay(status: string) {
  const isAssigned = status.endsWith(' - Assigned');
  const baseStatus = isAssigned ? status.replace(/ - Assigned$/, '') : status;
  // Handle "Partially Dead" → "Partially Dead Lead" for color lookup
  const colorKey = baseStatus === 'Partially Dead' ? 'Partially Dead Lead' : baseStatus;
  return { baseStatus, isAssigned, colorKey };
}

export function MobileLeadCard({ lead, isSelected, onClick }: MobileLeadCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{lead.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
            {lead.company && (
              <p className="text-sm text-muted-foreground">{lead.company}</p>
            )}
            <div className="text-sm" onClick={(e) => e.stopPropagation()}>
              <AssignmentDropdown
                currentAssignee={lead.assigned_to}
                webhookUrl={lead.assign_webhook_url}
                masterStatus={lead.master_status}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-primary">
              {lead.average_score?.toFixed(1) || '—'}
            </div>
            <div className="text-xs text-muted-foreground">score</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {(() => {
            const { baseStatus, isAssigned, colorKey } = getStatusDisplay(lead.master_status || '');
            return (
              <Badge
                variant="secondary"
                className={masterStatusColors[colorKey] || ''}
              >
                {baseStatus}
                {isAssigned && <UserCheck className="w-3 h-3 ml-1 inline" />}
              </Badge>
            );
          })()}
          <Badge variant="outline" className="text-xs">
            {lead.status}
          </Badge>
          {lead.lead_source && (
            <Badge
              variant="outline"
              className={`text-xs ${
                lead.lead_source === 'Website'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              {lead.lead_source}
            </Badge>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground space-y-2">
          <div>
            <span className="block font-medium">Created</span>
            {formatInDubaiTime(lead.created_at, 'MMM d, h:mm a')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block font-medium">Last Contact</span>
              {formatInDubaiTime(lead.last_contact_timestamp, 'MMM d, h:mm a')}
            </div>
            <div>
              <span className="block font-medium">Next Follow-up</span>
              {formatInDubaiTime(lead.next_followup_timestamp, 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
