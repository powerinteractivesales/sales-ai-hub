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
  followups_due_now: 0,
  followups_due_today: 0,
  new_leads_last_24h: 0,
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
  const { masterStatuses, statuses, countries } = useMemo(() => {
    const leads = payload?.leads || [];
    return {
      masterStatuses: [...new Set(leads.map(l => l.master_status).filter(Boolean))],
      statuses: [...new Set(leads.map(l => l.status).filter(Boolean))],
      countries: [...new Set(leads.map(l => l.country).filter(Boolean))],
    };
  }, [payload?.leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    const leads = payload?.leads || [];
    return leads.filter(lead => {
      const matchesSearch = !searchQuery || 
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMasterStatus = masterStatusFilter === 'all' || lead.master_status === masterStatusFilter;
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesCountry = countryFilter === 'all' || lead.country === countryFilter;
      return matchesSearch && matchesMasterStatus && matchesStatus && matchesCountry;
    });
  }, [payload?.leads, searchQuery, masterStatusFilter, statusFilter, countryFilter]);

  const summary = payload?.summary || DEFAULT_SUMMARY;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        updatedAt={payload?.updated_at || null}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
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
        />

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Lead List */}
          <div className={`flex-1 ${!isMobile && selectedLead ? 'max-w-[calc(100%-400px)]' : ''}`}>
            {isMobile ? (
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[160px] rounded-lg" />
                  ))
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border border-border/50">
                    <p className="text-muted-foreground">No leads found matching your filters.</p>
                  </div>
                ) : (
                  filteredLeads.map(lead => (
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
                leads={filteredLeads}
                selectedLeadId={selectedLead?.id || null}
                onSelectLead={setSelectedLead}
                isLoading={isLoading}
              />
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
