import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { LeadRow, LeadDetail as LeadDetailType } from '@/types/dashboard';
import { fetchLead } from '@/lib/api';
import { formatInDubaiTime } from '@/lib/timezone';
import { X, Mail, Phone, Building2, MapPin, Calendar, MessageSquare } from 'lucide-react';

interface LeadDetailProps {
  lead: LeadRow;
  onClose: () => void;
}

const masterStatusColors: Record<string, string> = {
  'Warm Lead': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Cold Lead': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  'Qualified Lead': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Hot Lead': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const [fullLead, setFullLead] = useState<LeadDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLead() {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchLead(lead.id);
        if (!cancelled) {
          setFullLead(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load lead details');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadLead();
    return () => { cancelled = true; };
  }, [lead.id]);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{lead.name}</h2>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              className={masterStatusColors[lead.master_status] || ''}
            >
              {lead.master_status}
            </Badge>
            <Badge variant="outline">{lead.status}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{lead.company}</span>
              </div>
            )}
            {lead.country && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{lead.country}</span>
              </div>
            )}
            {lead.assigned_to && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Assigned To: </span>
                <span>{lead.assigned_to}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Scores */}
          {(lead.persona_fit !== null || lead.activation_fit !== null || lead.intent_score !== null || lead.average_score !== null) && (
            <div>
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Scores</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <ScoreCard label="Persona Fit" value={lead.persona_fit} />
                <ScoreCard label="Activation" value={lead.activation_fit} />
                <ScoreCard label="Intent" value={lead.intent_score} />
                <ScoreCard label="Average" value={lead.average_score} />
              </div>
            </div>
          )}

          <Separator />

          {/* Context */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : fullLead && (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-3">Lead Context</h3>
                <div className="space-y-2 text-sm">
                  {fullLead.where && (
                    <div>
                      <span className="text-muted-foreground">Where: </span>
                      <span>{fullLead.where}</span>
                    </div>
                  )}
                  {fullLead.what_matters && (
                    <div>
                      <span className="text-muted-foreground">What matters: </span>
                      <span>{fullLead.what_matters}</span>
                    </div>
                  )}
                  {fullLead.experience_with_technology && (
                    <div>
                      <span className="text-muted-foreground">Tech experience: </span>
                      <span>{fullLead.experience_with_technology}</span>
                    </div>
                  )}
                  {fullLead.ad_name && (
                    <div>
                      <span className="text-muted-foreground">Ad: </span>
                      <span>{fullLead.ad_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last contact:</span>
                    <span>{formatInDubaiTime(fullLead.last_contact_timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Next follow-up:</span>
                    <span>{formatInDubaiTime(fullLead.next_followup_timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Conversation History */}
              {fullLead.conversation_history && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">Conversation History</h3>
                    </div>
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-4 overflow-auto max-h-[400px] text-sm"
                      dangerouslySetInnerHTML={{ __html: fullLead.conversation_history }}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  const score = value ?? 0;
  const percentage = (score / 10) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
