import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/utils/constants';
import { Breadcrumb } from '@/components/Breadcrumb';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function EquipmentCreatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    make: '',
    serialNo: '',
    modelNo: '',
    cost: '',
    purchaseDate: '',
    fundingSource: '',
    stockPageNo: '',
    stockSerialNo: '',
    block: '',
    hallNo: '',
    labId: '',
    facultyInChargeId: '',
    workingStatus: 'WORKING',
    physicalPresence: true,
    remarks: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (id) {
      loadEquipmentData();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [labsRes, facultiesRes] = await Promise.all([
        supabase.from('labs').select('*, department:departments(*)'),
        supabase.from('profiles').select('*'),
      ]);

      if (labsRes.error) throw labsRes.error;
      if (facultiesRes.error) throw facultiesRes.error;

      setLabs(labsRes.data || []);
      setFaculties(facultiesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load form data');
    }
  };

  const loadEquipmentData = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          make: data.make,
          serialNo: data.serial_no,
          modelNo: data.model_no || '',
          cost: data.cost.toString(),
          purchaseDate: data.purchase_date,
          fundingSource: data.funding_source,
          stockPageNo: data.stock_page_no,
          stockSerialNo: data.stock_serial_no,
          block: data.block,
          hallNo: data.hall_no,
          labId: data.lab_id,
          facultyInChargeId: data.faculty_in_charge_id,
          workingStatus: data.working_status,
          physicalPresence: data.physical_presence,
          remarks: data.remarks || '',
        });
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Failed to load equipment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const equipmentData = {
        name: formData.name,
        make: formData.make,
        serial_no: formData.serialNo,
        model_no: formData.modelNo || null,
        qr_code: `EQ-${formData.serialNo}`,
        cost: parseFloat(formData.cost),
        purchase_date: formData.purchaseDate,
        funding_source: formData.fundingSource,
        stock_page_no: formData.stockPageNo,
        stock_serial_no: formData.stockSerialNo,
        block: formData.block,
        hall_no: formData.hallNo,
        lab_id: formData.labId,
        faculty_in_charge_id: formData.facultyInChargeId,
        working_status: formData.workingStatus,
        physical_presence: formData.physicalPresence,
        remarks: formData.remarks || null,
      };

      if (id) {
        const { error } = await supabase
          .from('equipment')
          .update(equipmentData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Equipment updated successfully');
      } else {
        const { error } = await supabase
          .from('equipment')
          .insert([equipmentData]);

        if (error) throw error;
        toast.success('Equipment created successfully');
      }

      navigate(ROUTES.EQUIPMENT);
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      toast.error(error.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Equipment', href: ROUTES.EQUIPMENT },
          { label: id ? 'Edit Equipment' : 'Add Equipment' },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.EQUIPMENT)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{id ? 'Edit Equipment' : 'Add New Equipment'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Purchase Details */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="fundingSource">Funding Source *</Label>
                <Input
                  id="fundingSource"
                  value={formData.fundingSource}
                  onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockPageNo">Stock Page No. *</Label>
                <Input
                  id="stockPageNo"
                  value={formData.stockPageNo}
                  onChange={(e) => setFormData({ ...formData, stockPageNo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockSerialNo">Stock Serial No. *</Label>
                <Input
                  id="stockSerialNo"
                  value={formData.stockSerialNo}
                  onChange={(e) => setFormData({ ...formData, stockSerialNo: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="hallNo">Hall No. *</Label>
                <Input
                  id="hallNo"
                  value={formData.hallNo}
                  onChange={(e) => setFormData({ ...formData, hallNo: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lab">Lab *</Label>
                <Select
                  value={formData.labId}
                  onValueChange={(value) => setFormData({ ...formData, labId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {labs.map((lab) => (
                      <SelectItem key={lab.id} value={lab.id}>
                        {lab.name} {lab.department && `- ${lab.department.code}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facultyInCharge">Faculty In-Charge *</Label>
                <Select
                  value={formData.facultyInChargeId}
                  onValueChange={(value) => setFormData({ ...formData, facultyInChargeId: value })}
                >
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
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingStatus">Working Status *</Label>
                <Select
                  value={formData.workingStatus}
                  onValueChange={(value) => setFormData({ ...formData, workingStatus: value })}
                >
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
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.EQUIPMENT)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Equipment' : 'Create Equipment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
