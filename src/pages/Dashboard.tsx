import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { LeadFilters } from '@/components/dashboard/LeadFilters';
import { LeadTable } from '@/components/dashboard/LeadTable';
import { LeadDetail } from '@/components/dashboard/LeadDetail';
import { MobileLeadCard } from '@/components/dashboard/MobileLeadCard';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboard, refreshDashboard, isAuthenticated } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import type { DashboardPayload, LeadRow, DashboardSummary } from '@/types/dashboard';

const DEFAULT_SUMMARY: DashboardSummary = {
  total_leads: 0,
  by_status: {},
  by_master_status: {},
  by_country: {},
  by_lead_source: {},

  // Follow-up metrics
  followups_due_now: 0,
  followups_due_this_week: 0,

  // New leads tracking
  new_leads_last_24h: 0,
  new_leads_last_7_days: 0,
  new_leads_last_30_days: 0,

  // Engagement metrics
  total_leads_with_replies: 0,
  response_rate: 0,

  // Lead quality metrics
  hot_leads_count: 0,
  qualified_leads_count: 0,
  dead_leads_count: 0,
  conversion_rate: 0,
  dead_lead_rate: 0,

  // Score metrics (Meta leads only)
  avg_lead_score: 0,
  avg_persona_fit: 0,
  avg_activation_fit: 0,
  avg_intent_score: 0,
  total_meta_leads: 0,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [masterStatusFilter, setMasterStatusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [assignedToFilter, setAssignedToFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Sorting
  const [sortField, setSortField] = useState<'last_contact' | 'next_followup' | 'score' | 'name' | 'assigned_to' | 'created'>('last_contact');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Load dashboard data
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDashboard();
        setPayload(data);
      } catch (error) {
        toast({
          title: 'Failed to load dashboard',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [toast]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await refreshDashboard();
      setPayload(data);
      toast({
        title: 'Dashboard refreshed',
        description: 'Data has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: error instanceof Error ? error.message : 'Could not refresh data.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Extract unique filter values
  const { masterStatuses, statuses, countries, assignedTos } = useMemo(() => {
    const leads = payload?.leads || [];
    return {
      masterStatuses: [...new Set(leads.map(l => l.master_status).filter(Boolean))],
      statuses: [...new Set(leads.map(l => l.status).filter(Boolean))],
      countries: [...new Set(leads.map(l => l.country).filter(Boolean))],
      assignedTos: [...new Set(leads.map(l => l.assigned_to).filter(Boolean))],
    };
  }, [payload?.leads]);

  // Filter, sort, and paginate leads
  const { sortedLeads, paginatedLeads, totalPages } = useMemo(() => {
    const leads = payload?.leads || [];

    // Filter
    const filtered = leads.filter(lead => {
      const matchesSearch = !searchQuery ||
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMasterStatus = masterStatusFilter === 'all' || lead.master_status === masterStatusFilter;
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesCountry = countryFilter === 'all' || lead.country === countryFilter;
      const matchesAssignedTo = assignedToFilter === 'all' || lead.assigned_to === assignedToFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter.from || dateRangeFilter.to) {
        if (!lead.created_at) {
          matchesDateRange = false;
        } else {
          const createdDate = new Date(lead.created_at);
          if (dateRangeFilter.from) {
            const fromDate = new Date(dateRangeFilter.from);
            fromDate.setHours(0, 0, 0, 0);
            if (createdDate < fromDate) matchesDateRange = false;
          }
          if (dateRangeFilter.to) {
            const toDate = new Date(dateRangeFilter.to);
            toDate.setHours(23, 59, 59, 999);
            if (createdDate > toDate) matchesDateRange = false;
          }
        }
      }

      return matchesSearch && matchesMasterStatus && matchesStatus && matchesCountry && matchesAssignedTo && matchesDateRange;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'last_contact':
          aVal = a.last_contact_timestamp ? new Date(a.last_contact_timestamp).getTime() : 0;
          bVal = b.last_contact_timestamp ? new Date(b.last_contact_timestamp).getTime() : 0;
          break;
        case 'next_followup':
          aVal = a.next_followup_timestamp ? new Date(a.next_followup_timestamp).getTime() : Infinity;
          bVal = b.next_followup_timestamp ? new Date(b.next_followup_timestamp).getTime() : Infinity;
          break;
        case 'score':
          aVal = a.average_score ?? 0;
          bVal = b.average_score ?? 0;
          break;
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'assigned_to':
          aVal = a.assigned_to?.toLowerCase() || '';
          bVal = b.assigned_to?.toLowerCase() || '';
          break;
        case 'created':
          aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
          bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate
    const total = Math.ceil(sorted.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const paginated = sorted.slice(startIdx, startIdx + pageSize);

    return { sortedLeads: sorted, paginatedLeads: paginated, totalPages: total };
  }, [payload?.leads, searchQuery, masterStatusFilter, statusFilter, countryFilter, assignedToFilter, dateRangeFilter, sortField, sortDirection, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, masterStatusFilter, statusFilter, countryFilter, assignedToFilter, dateRangeFilter]);

  const summary = payload?.summary || DEFAULT_SUMMARY;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        updatedAt={payload?.updated_at || null}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <main className="w-full px-6 py-6 space-y-6">
        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg" />
            ))}
          </div>
        ) : (
          <KPICards summary={summary} />
        )}

        {/* Filters */}
        <LeadFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          masterStatusFilter={masterStatusFilter}
          onMasterStatusChange={setMasterStatusFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          countryFilter={countryFilter}
          onCountryChange={setCountryFilter}
          masterStatuses={masterStatuses}
          statuses={statuses}
          countries={countries}
          assignedTos={assignedTos}
          assignedToFilter={assignedToFilter}
          onAssignedToChange={setAssignedToFilter}
          dateRangeFilter={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
        />

        {/* Main Content Area */}
        <div className="flex gap-6 w-full">
          {/* Lead List */}
          <div className={`min-w-0 flex-1 ${!isMobile && selectedLead ? 'max-w-[calc(100%-400px)]' : 'w-full'}`}>
            {isMobile ? (
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[160px] rounded-lg" />
                  ))
                ) : paginatedLeads.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border border-border/50">
                    <p className="text-muted-foreground">No leads found matching your filters.</p>
                  </div>
                ) : (
                  paginatedLeads.map((lead: LeadRow) => (
                    <MobileLeadCard
                      key={lead.id}
                      lead={lead}
                      isSelected={selectedLead?.id === lead.id}
                      onClick={() => setSelectedLead(lead)}
                    />
                  ))
                )}
              </div>
            ) : (
              <LeadTable
                leads={paginatedLeads}
                selectedLeadId={selectedLead?.id || null}
                onSelectLead={setSelectedLead}
                isLoading={isLoading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={(field, direction) => {
                  setSortField(field);
                  setSortDirection(direction);
                }}
              />
            )}

            {/* Pagination Controls */}
            {!isLoading && sortedLeads.length > 0 && (
              <div className="mt-4 flex items-center justify-between bg-card rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
                  </span>
                  <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-sm text-muted-foreground">
                      Per page:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1 rounded border border-input bg-background text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                  >
                    Previous
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Detail Panel */}
          {!isMobile && selectedLead && (
            <div className="w-[400px] shrink-0">
              <div className="sticky top-24 h-[calc(100vh-120px)] rounded-lg overflow-hidden border border-border/50">
                <LeadDetail
                  lead={selectedLead}
                  onClose={() => setSelectedLead(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Detail Sheet */}
        {isMobile && (
          <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
            <SheetContent side="bottom" className="h-[90vh] p-0">
              {selectedLead && (
                <LeadDetail
                  lead={selectedLead}
                  onClose={() => setSelectedLead(null)}
                />
              )}
            </SheetContent>
          </Sheet>
        )}
      </main>
    </div>
  );
}
