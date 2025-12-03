import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

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
}: LeadFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
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
        <SelectTrigger className="w-full sm:w-[160px]">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
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
        <SelectTrigger className="w-full sm:w-[160px]">
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
        <SelectTrigger className="w-full sm:w-[140px]">
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
    </div>
  );
}
