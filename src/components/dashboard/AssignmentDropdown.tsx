import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TEAM_MEMBERS = [
  'Zeeshan Qazafi',
  'Shemeer Mohammed',
  'Naji Saeed',
  'Tharindu Hettiarchchi',
];

interface AssignmentDropdownProps {
  currentAssignee: string | null | undefined;
  webhookUrl: string | undefined;
  masterStatus?: string;
  onAssignmentSuccess?: (newAssignee: string) => void;
}

export function AssignmentDropdown({
  currentAssignee,
  webhookUrl,
  masterStatus,
  onAssignmentSuccess,
}: AssignmentDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAssign = async (assignee: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!webhookUrl) {
      toast({
        title: 'Assignment failed',
        description: 'No webhook URL configured for this lead.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsOpen(false);

    try {
      const url = `${webhookUrl}&assignee=${encodeURIComponent(assignee)}&master_status=${encodeURIComponent(masterStatus || '')}`;
      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        throw new Error('Assignment request failed');
      }

      toast({
        title: 'Lead assigned',
        description: `Successfully assigned to ${assignee}. Please refresh to see changes.`,
      });

      onAssignmentSuccess?.(assignee);
    } catch (error) {
      toast({
        title: 'Assignment failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-sm font-normal"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              {currentAssignee || 'Assign'}
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {TEAM_MEMBERS.map((member) => (
          <DropdownMenuItem
            key={member}
            onClick={(e) => handleAssign(member, e)}
            className="text-sm"
          >
            {currentAssignee === member && (
              <Check className="h-3 w-3 mr-2" />
            )}
            {member}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
