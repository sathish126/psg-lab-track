import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { X, Trash2 } from 'lucide-react';
import { EquipmentStatus } from '@/types';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusChange: (status: EquipmentStatus) => void;
  onBulkDelete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkStatusChange,
  onBulkDelete,
}: BulkActionsBarProps) {
  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedCount} selected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bulk Actions:</span>
            <Select onValueChange={(value) => onBulkStatusChange(value as EquipmentStatus)}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WORKING">Set as Working</SelectItem>
                <SelectItem value="NOT_WORKING">Set as Not Working</SelectItem>
                <SelectItem value="REPAIRABLE">Set as Repairable</SelectItem>
                <SelectItem value="TO_BE_SCRAPPED">Set as To Be Scrapped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="h-8"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected
        </Button>
      </div>
    </Card>
  );
}
