import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentDropdown } from './AssignmentDropdown';
import type { LeadRow } from '@/types/dashboard';
import { formatInDubaiTime } from '@/lib/timezone';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, UserCheck } from 'lucide-react';

type SortField = 'last_contact' | 'next_followup' | 'score' | 'name' | 'assigned_to' | 'created';
type SortDirection = 'asc' | 'desc';

interface LeadTableProps {
  leads: LeadRow[];
  selectedLeadId: number | string | null;
  onSelectLead: (lead: LeadRow) => void;
  isLoading?: boolean;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
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
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function LeadTable({ leads, selectedLeadId, onSelectLead, isLoading, sortField, sortDirection, onSort }: LeadTableProps) {
  const handleSort = (field: SortField) => {
    if (!onSort) return;
    if (sortField === field) {
      // Toggle direction
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for time fields, asc for others
      onSort(field, field === 'last_contact' || field === 'next_followup' || field === 'created' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    return sortDirection === 'asc' ?
      <ArrowUp className="h-4 w-4 ml-1" /> :
      <ArrowDown className="h-4 w-4 ml-1" />;
  };
  if (!isLoading && leads.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border/50">
        <p className="text-muted-foreground">No leads found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead
                className="font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Name
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Country</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead
                className="font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('assigned_to')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Assigned
                  <SortIcon field="assigned_to" />
                </div>
              </TableHead>
              <TableHead
                className="font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('created')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Created
                  <SortIcon field="created" />
                </div>
              </TableHead>
              <TableHead
                className="font-semibold text-right cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center justify-end whitespace-nowrap">
                  Score
                  <SortIcon field="score" />
                </div>
              </TableHead>
              <TableHead
                className="font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('last_contact')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Last Contact
                  <SortIcon field="last_contact" />
                </div>
              </TableHead>
              <TableHead
                className="font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('next_followup')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Follow-up
                  <SortIcon field="next_followup" />
                </div>
              </TableHead>
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
                  <TableCell className="font-medium max-w-[150px]">
                    <div className="flex items-center gap-1">
                      <span className="truncate">{lead.name}</span>
                      {lead.lead_source && (
                        <Badge
                          variant="outline"
                          className={`text-xs px-1 py-0 shrink-0 ${
                            lead.lead_source === 'Website'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {lead.lead_source === 'Website' ? 'Web' : 'Meta'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[180px] truncate">{lead.email}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{lead.company || '—'}</TableCell>
                  <TableCell>{lead.country || '—'}</TableCell>
                  <TableCell>{lead.status || '—'}</TableCell>
                  <TableCell>
                    {(() => {
                      const { baseStatus, isAssigned, colorKey } = getStatusDisplay(lead.master_status || '');
                      return (
                        <Badge
                          variant="secondary"
                          className={`text-sm font-medium px-2 py-0.5 whitespace-nowrap ${masterStatusColors[colorKey] || 'bg-secondary text-secondary-foreground'}`}
                        >
                          {baseStatus || '—'}
                          {isAssigned && <UserCheck className="w-3 h-3 ml-1 inline" />}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <AssignmentDropdown
                      currentAssignee={lead.assigned_to}
                      webhookUrl={lead.assign_webhook_url}
                      masterStatus={lead.master_status}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatInDubaiTime(lead.created_at, 'MMM d, h:mma')}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {lead.average_score?.toFixed(1) || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatInDubaiTime(lead.last_contact_timestamp, 'MMM d, h:mma')}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatInDubaiTime(lead.next_followup_timestamp, 'MMM d, h:mma')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
    </div>
  );
}
