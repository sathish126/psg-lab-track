import { useEffect, useState } from 'react';
import { labApi, equipmentApi } from '@/lib/api';
import { Lab, Equipment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Package, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/utils/constants';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function LabsPage() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [labsData, equipmentData] = await Promise.all([
        labApi.getAll(),
        equipmentApi.getAll(),
      ]);
      setLabs(labsData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Failed to load labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLabEquipmentCount = (labId: string) => {
    return equipment.filter(eq => eq.labId === labId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Labs' }]} />
      
      <div>
        <h1 className="text-3xl font-bold">Labs</h1>
        <p className="text-muted-foreground mt-1">
          Manage laboratory spaces and equipment
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <Card 
            key={lab.id} 
            className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
            onClick={() => navigate(ROUTES.LAB_DETAILS(lab.id))}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{lab.name}</CardTitle>
                </div>
                <Badge variant="secondary">{lab.labCode}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-primary" />
                <span className="font-medium">{getLabEquipmentCount(lab.id)}</span>
                <span className="text-muted-foreground">Equipment</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Block {lab.block}, Hall {lab.hallNo}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lab.inCharge?.name}</p>
                  <p className="text-xs text-muted-foreground">In-Charge</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">{lab.department?.name}</p>
                <p className="text-xs text-muted-foreground">Department</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
