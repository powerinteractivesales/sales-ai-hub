import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { LeadRow } from '@/types/dashboard';
import { formatInDubaiTime } from '@/lib/timezone';
import { cn } from '@/lib/utils';

interface LeadTableProps {
  leads: LeadRow[];
  selectedLeadId: number | null;
  onSelectLead: (lead: LeadRow) => void;
  isLoading?: boolean;
}

const masterStatusColors: Record<string, string> = {
  'Warm Lead': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Cold Lead': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  'Qualified Lead': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Hot Lead': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function LeadTable({ leads, selectedLeadId, onSelectLead, isLoading }: LeadTableProps) {
  if (!isLoading && leads.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border/50">
        <p className="text-muted-foreground">No leads found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Country</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="font-semibold text-right">Score</TableHead>
              <TableHead className="font-semibold">Last Contact</TableHead>
              <TableHead className="font-semibold">Next Follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selectedLeadId === lead.id && 'bg-primary/5'
                  )}
                >
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                  <TableCell>{lead.company || '—'}</TableCell>
                  <TableCell>{lead.country || '—'}</TableCell>
                  <TableCell>
                    <span className="text-sm">{lead.status || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={masterStatusColors[lead.master_status] || 'bg-secondary text-secondary-foreground'}
                    >
                      {lead.master_status || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {lead.average_score?.toFixed(1) || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatInDubaiTime(lead.last_contact_timestamp, 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatInDubaiTime(lead.next_followup_timestamp, 'MMM d, h:mm a')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
