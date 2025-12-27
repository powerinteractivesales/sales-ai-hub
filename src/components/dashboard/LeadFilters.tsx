import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LeadFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  masterStatusFilter: string;
  onMasterStatusChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  countryFilter: string;
  onCountryChange: (value: string) => void;
  masterStatuses: string[];
  statuses: string[];
  countries: string[];
  assignedTos: string[];
  assignedToFilter: string;
  onAssignedToChange: (value: string) => void;
  dateRangeFilter: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (value: { from: Date | undefined; to: Date | undefined }) => void;
}

export function LeadFilters({
  searchQuery,
  onSearchChange,
  masterStatusFilter,
  onMasterStatusChange,
  statusFilter,
  onStatusChange,
  countryFilter,
  onCountryChange,
  masterStatuses,
  statuses,
  countries,
  assignedTos,
  assignedToFilter,
  onAssignedToChange,
  dateRangeFilter,
  onDateRangeChange,
}: LeadFiltersProps) {
  const hasDateFilter = dateRangeFilter.from || dateRangeFilter.to;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-full sm:w-auto sm:min-w-[280px] sm:flex-1 sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Master Status Filter */}
      <Select value={masterStatusFilter} onValueChange={onMasterStatusChange}>
        <SelectTrigger className="w-[calc(50%-6px)] sm:w-[140px]">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {masterStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[calc(50%-6px)] sm:w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Country Filter */}
      <Select value={countryFilter} onValueChange={onCountryChange}>
        <SelectTrigger className="w-[calc(50%-6px)] sm:w-[130px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Assigned To Filter */}
      <Select value={assignedToFilter} onValueChange={onAssignedToChange}>
        <SelectTrigger className="w-[calc(50%-6px)] sm:w-[140px]">
          <SelectValue placeholder="Assigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assigned</SelectItem>
          {assignedTos.map((assignedTo) => (
            <SelectItem key={assignedTo} value={assignedTo}>
              {assignedTo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full sm:w-[220px] justify-start text-left font-normal',
              !hasDateFilter && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="h-4 w-4 mr-2 shrink-0" />
            {hasDateFilter ? (
              <span className="truncate">
                {dateRangeFilter.from ? format(dateRangeFilter.from, 'MMM d') : '...'}
                {' — '}
                {dateRangeFilter.to ? format(dateRangeFilter.to, 'MMM d') : '...'}
              </span>
            ) : (
              'Created date'
            )}
            {hasDateFilter && (
              <X
                className="h-4 w-4 ml-auto shrink-0 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateRangeChange({ from: undefined, to: undefined });
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="p-3 border-b sm:border-b-0 sm:border-r">
              <p className="text-sm font-medium text-muted-foreground mb-2">From</p>
              <Calendar
                mode="single"
                selected={dateRangeFilter.from}
                onSelect={(date) => onDateRangeChange({ ...dateRangeFilter, from: date })}
                initialFocus
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-muted-foreground mb-2">To</p>
              <Calendar
                mode="single"
                selected={dateRangeFilter.to}
                onSelect={(date) => onDateRangeChange({ ...dateRangeFilter, to: date })}
                disabled={(date) => {
                  if (!dateRangeFilter.from) return false;
                  return date < dateRangeFilter.from;
                }}
              />
            </div>
          </div>
          <div className="p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
            >
              Clear dates
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick Date Presets */}
      {(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Check which preset is active
        const is24h = dateRangeFilter.from && dateRangeFilter.to &&
          Math.abs(today.getTime() - new Date(dateRangeFilter.from).setHours(0, 0, 0, 0)) < 86400000 &&
          format(dateRangeFilter.to, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        const is7d = dateRangeFilter.from && dateRangeFilter.to &&
          Math.abs(new Date(dateRangeFilter.from).getTime() - (today.getTime() - 6 * 86400000)) < 86400000 &&
          format(dateRangeFilter.to, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        const is30d = dateRangeFilter.from && dateRangeFilter.to &&
          Math.abs(new Date(dateRangeFilter.from).getTime() - (today.getTime() - 29 * 86400000)) < 86400000 &&
          format(dateRangeFilter.to, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        return (
          <div className="flex gap-1">
            <Button
              variant={is24h ? "default" : "outline"}
              size="sm"
              className="text-xs px-2"
              onClick={() => {
                const from = new Date(today);
                onDateRangeChange({ from, to: now });
              }}
            >
              24h
            </Button>
            <Button
              variant={is7d ? "default" : "outline"}
              size="sm"
              className="text-xs px-2"
              onClick={() => {
                const from = new Date(today);
                from.setDate(from.getDate() - 6);
                onDateRangeChange({ from, to: now });
              }}
            >
              7d
            </Button>
            <Button
              variant={is30d ? "default" : "outline"}
              size="sm"
              className="text-xs px-2"
              onClick={() => {
                const from = new Date(today);
                from.setDate(from.getDate() - 29);
                onDateRangeChange({ from, to: now });
              }}
            >
              30d
            </Button>
          </div>
        );
      })()}
    </div>
  );
}
