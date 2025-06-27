import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { GlassInput } from "./glass-input";
import { GlassButton } from "./glass-button";
import { GlassCard } from "./glass-card";

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'text';
  options?: { value: string; label: string }[];
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  filterOptions?: FilterOption[];
  placeholder?: string;
  className?: string;
}

export function SearchFilter({ 
  onSearch, 
  onFilter, 
  filterOptions = [], 
  placeholder = "Search...",
  className 
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={className}>
      <div className="flex items-center space-x-4 mb-4">
        {/* Search Input */}
        <div className="flex-1">
          <GlassInput
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Filter Toggle */}
        {filterOptions.length > 0 && (
          <GlassButton
            variant={showFilters ? "primary" : "default"}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </GlassButton>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filterOptions.length > 0 && (
        <GlassCard className="mb-4 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-black dark:text-white">Filters</h3>
            <div className="flex items-center space-x-2">
              {activeFilterCount > 0 && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear All
                </GlassButton>
              )}
              <GlassButton
                variant="default"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map((option) => (
              <div key={option.key}>
                {option.type === 'select' && option.options && (
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      {option.label}
                    </label>
                    <select
                      className="glass-input w-full rounded-xl px-4 py-3 text-black dark:text-white"
                      value={filters[option.key] || ""}
                      onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    >
                      <option value="">All</option>
                      {option.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {option.type === 'date' && (
                  <GlassInput
                    label={option.label}
                    type="date"
                    value={filters[option.key] || ""}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                  />
                )}

                {option.type === 'text' && (
                  <GlassInput
                    label={option.label}
                    value={filters[option.key] || ""}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}