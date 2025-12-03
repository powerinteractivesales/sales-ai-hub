import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LeadRow } from '@/types/dashboard';
import { formatInDubaiTime } from '@/lib/timezone';
import { cn } from '@/lib/utils';

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
};

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
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-primary">
              {lead.average_score?.toFixed(1) || '—'}
            </div>
            <div className="text-xs text-muted-foreground">score</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Badge 
            variant="secondary"
            className={masterStatusColors[lead.master_status] || ''}
          >
            {lead.master_status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {lead.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
          <div>
            <span className="block font-medium">Last Contact</span>
            {formatInDubaiTime(lead.last_contact_timestamp, 'MMM d, h:mm a')}
          </div>
          <div>
            <span className="block font-medium">Next Follow-up</span>
            {formatInDubaiTime(lead.next_followup_timestamp, 'MMM d, h:mm a')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
