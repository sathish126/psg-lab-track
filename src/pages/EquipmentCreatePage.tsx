import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useAuthStore } from '@/stores/authStore';
import { labApi, userApi } from '@/lib/api';
import { Lab, User, EquipmentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';
import { toast } from 'sonner';

export default function EquipmentCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createEquipment, updateEquipment, fetchEquipmentById, selectedEquipment, loading } = useEquipmentStore();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [faculties, setFaculties] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    make: '',
    serialNo: '',
    modelNo: '',
    purchaseDate: '',
    cost: '',
    fundingSource: '',
    stockPageNo: '',
    stockSerialNo: '',
    block: '',
    hallNo: '',
    labId: '',
    facultyInChargeId: '',
    workingStatus: 'WORKING' as EquipmentStatus,
    remarks: '',
  });

  const isEdit = Boolean(id);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      fetchEquipmentById(id);
    }
  }, [id, isEdit, fetchEquipmentById]);

  useEffect(() => {
    if (isEdit && selectedEquipment) {
      setFormData({
        name: selectedEquipment.name,
        make: selectedEquipment.make,
        serialNo: selectedEquipment.serialNo,
        modelNo: selectedEquipment.modelNo || '',
        purchaseDate: new Date(selectedEquipment.purchaseDate).toISOString().split('T')[0],
        cost: selectedEquipment.cost.toString(),
        fundingSource: selectedEquipment.fundingSource,
        stockPageNo: selectedEquipment.stockPageNo,
        stockSerialNo: selectedEquipment.stockSerialNo,
        block: selectedEquipment.block,
        hallNo: selectedEquipment.hallNo,
        labId: selectedEquipment.labId,
        facultyInChargeId: selectedEquipment.facultyInChargeId,
        workingStatus: selectedEquipment.workingStatus,
        remarks: selectedEquipment.remarks || '',
      });
    }
  }, [isEdit, selectedEquipment]);

  const loadData = async () => {
    try {
      const [labsData, usersData] = await Promise.all([
        labApi.getAll(),
        userApi.getAll(),
      ]);
      setLabs(labsData);
      setFaculties(usersData.filter(u => u.role === 'FACULTY' || u.role === 'HOD'));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        cost: parseFloat(formData.cost),
        purchaseDate: new Date(formData.purchaseDate),
        physicalPresence: true,
      };

      if (isEdit && id) {
        await updateEquipment(id, data);
        navigate(ROUTES.EQUIPMENT_DETAILS(id));
      } else {
        const newEq = await createEquipment(data);
        navigate(ROUTES.EQUIPMENT_DETAILS(newEq.id));
      }
    } catch (error) {
      // Error handled in store
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.EQUIPMENT)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Equipment' : 'Add Equipment'}</h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Update equipment information' : 'Add new equipment to the inventory'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNo">Serial Number *</Label>
              <Input
                id="serialNo"
                value={formData.serialNo}
                onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelNo">Model Number</Label>
              <Input
                id="modelNo"
                value={formData.modelNo}
                onChange={(e) => setFormData({ ...formData, modelNo: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Purchase Details */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (₹) *</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fundingSource">Funding Source *</Label>
              <Input
                id="fundingSource"
                value={formData.fundingSource}
                onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockPageNo">Stock Page Number</Label>
              <Input
                id="stockPageNo"
                value={formData.stockPageNo}
                onChange={(e) => setFormData({ ...formData, stockPageNo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockSerialNo">Stock Serial Number</Label>
              <Input
                id="stockSerialNo"
                value={formData.stockSerialNo}
                onChange={(e) => setFormData({ ...formData, stockSerialNo: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="labId">Lab *</Label>
              <Select value={formData.labId} onValueChange={(value) => setFormData({ ...formData, labId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lab" />
                </SelectTrigger>
                <SelectContent>
                  {labs.map((lab) => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.name} ({lab.department?.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="facultyInChargeId">Faculty In-Charge *</Label>
              <Select value={formData.facultyInChargeId} onValueChange={(value) => setFormData({ ...formData, facultyInChargeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="block">Block *</Label>
              <Input
                id="block"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hallNo">Hall Number *</Label>
              <Input
                id="hallNo"
                value={formData.hallNo}
                onChange={(e) => setFormData({ ...formData, hallNo: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingStatus">Working Status *</Label>
              <Select value={formData.workingStatus} onValueChange={(value) => setFormData({ ...formData, workingStatus: value as EquipmentStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORKING">Working</SelectItem>
                  <SelectItem value="NOT_WORKING">Not Working</SelectItem>
                  <SelectItem value="REPAIRABLE">Repairable</SelectItem>
                  <SelectItem value="TO_BE_SCRAPPED">To Be Scrapped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.EQUIPMENT)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Equipment' : 'Create Equipment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
