import { useEffect, useState } from 'react';
import { labApi, equipmentApi } from '@/lib/api';
import { Lab, Equipment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Package } from 'lucide-react';

export default function LabsPage() {
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
      <div>
        <h1 className="text-3xl font-bold">Labs</h1>
        <p className="text-muted-foreground mt-1">
          Manage laboratory spaces and equipment
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <Card key={lab.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{lab.name}</CardTitle>
                </div>
                <Badge variant="secondary">{lab.labCode}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{getLabEquipmentCount(lab.id)} Equipment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{lab.inCharge?.name}</span>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">Block {lab.block}, Hall {lab.hallNo}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium">{lab.department?.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
