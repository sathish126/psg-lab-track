import { Badge } from '@/components/ui/badge';
import { EquipmentStatus, VerificationStatus } from '@/types';
import { 
  EQUIPMENT_STATUS_LABELS, 
  EQUIPMENT_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
  VERIFICATION_STATUS_COLORS 
} from '@/lib/utils/constants';

interface StatusBadgeProps {
  status: EquipmentStatus | VerificationStatus;
  type: 'equipment' | 'verification';
}

export const StatusBadge = ({ status, type }: StatusBadgeProps) => {
  const isEquipment = type === 'equipment';
  const label = isEquipment 
    ? EQUIPMENT_STATUS_LABELS[status as EquipmentStatus]
    : VERIFICATION_STATUS_LABELS[status as VerificationStatus];
  
  const colorKey = isEquipment
    ? EQUIPMENT_STATUS_COLORS[status as EquipmentStatus]
    : VERIFICATION_STATUS_COLORS[status as VerificationStatus];

  const variantMap: Record<string, 'success' | 'destructive' | 'warning' | 'secondary' | 'default'> = {
    success: 'success',
    destructive: 'destructive',
    warning: 'warning',
    secondary: 'secondary',
  };

  const variant = variantMap[colorKey] || 'default';

  return (
    <Badge 
      variant={variant}
      className="font-medium"
    >
      {label}
    </Badge>
  );
};
