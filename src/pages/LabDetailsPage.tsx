import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { labApi, equipmentApi } from '@/lib/api';
import { Lab, Equipment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, Package, MapPin, User, Plus, Eye, BarChart3 } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function LabDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState<Lab | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadLabData();
    }
  }, [id]);

  const loadLabData = async () => {
    try {
      const [labData, allEquipment] = await Promise.all([
        labApi.getById(id!),
        equipmentApi.getAll(),
      ]);
      setLab(labData);
      setEquipment(allEquipment.filter(eq => eq.labId === id));
    } catch (error) {
      console.error('Failed to load lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lab not found</p>
        <Button onClick={() => navigate(ROUTES.LABS)} className="mt-4">
          Back to Labs
        </Button>
      </div>
    );
  }

  const workingEquipment = equipment.filter(eq => eq.workingStatus === 'WORKING').length;
  const verificationRate = equipment.length > 0 
    ? Math.round((workingEquipment / equipment.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Labs', href: ROUTES.LABS },
        { label: lab.name }
      ]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.LABS)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{lab.name}</h1>
              <Badge variant="secondary" className="text-sm">{lab.labCode}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{lab.department?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTES.EQUIPMENT_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Lab
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working</CardTitle>
            <BarChart3 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{workingEquipment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {equipment.length - workingEquipment}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Information */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="mt-1 font-medium">Block {lab.block}, Hall {lab.hallNo}</p>
              {lab.floor && <p className="text-sm text-muted-foreground">Floor {lab.floor}</p>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">In-Charge</p>
              <p className="mt-1 font-medium">{lab.inCharge?.name}</p>
              <p className="text-sm text-muted-foreground">{lab.inCharge?.email}</p>
            </div>
          </div>
          {lab.capacity && (
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                <p className="mt-1 font-medium">{lab.capacity} stations</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment in this Lab</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>In-Charge</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No equipment found in this lab
                  </TableCell>
                </TableRow>
              ) : (
                equipment.map(eq => (
                  <TableRow key={eq.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{eq.name}</div>
                        <div className="text-sm text-muted-foreground">{eq.make}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{eq.serialNo}</TableCell>
                    <TableCell>
                      <StatusBadge status={eq.workingStatus} type="equipment" />
                    </TableCell>
                    <TableCell>{formatDate(eq.purchaseDate)}</TableCell>
                    <TableCell>{formatCurrency(eq.cost)}</TableCell>
                    <TableCell>{eq.facultyInCharge?.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(ROUTES.EQUIPMENT_DETAILS(eq.id))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
