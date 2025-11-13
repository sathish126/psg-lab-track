import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export interface EquipmentFilters {
  search: string;
  workingStatus?: string;
  labId?: string;
  departmentId?: string;
  minCost?: number;
  maxCost?: number;
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
}

interface AdvancedFiltersProps {
  filters: EquipmentFilters;
  onFiltersChange: (filters: EquipmentFilters) => void;
  labs?: Array<{ id: string; name: string }>;
  departments?: Array<{ id: string; name: string }>;
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange,
  labs = [],
  departments = []
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = { search: '' };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFiltersCount = Object.keys(filters).filter(
    key => key !== 'search' && filters[key as keyof EquipmentFilters]
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Apply multiple filters to narrow down equipment results
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="working-status">Working Status</Label>
            <Select
              value={localFilters.workingStatus || ''}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, workingStatus: value || undefined })
              }
            >
              <SelectTrigger id="working-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="WORKING">Working</SelectItem>
                <SelectItem value="NOT_WORKING">Not Working</SelectItem>
                <SelectItem value="REPAIRABLE">Repairable</SelectItem>
                <SelectItem value="TO_BE_SCRAPPED">To Be Scrapped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={localFilters.departmentId || ''}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, departmentId: value || undefined })
              }
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lab">Lab</Label>
            <Select
              value={localFilters.labId || ''}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, labId: value || undefined })
              }
            >
              <SelectTrigger id="lab">
                <SelectValue placeholder="All labs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labs</SelectItem>
                {labs.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id}>
                    {lab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cost Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  placeholder="Min cost"
                  value={localFilters.minCost || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minCost: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max cost"
                  value={localFilters.maxCost || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxCost: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Purchase Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  value={localFilters.purchaseDateFrom || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      purchaseDateFrom: e.target.value || undefined,
                    })
                  }
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={localFilters.purchaseDateTo || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      purchaseDateTo: e.target.value || undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="outline">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
