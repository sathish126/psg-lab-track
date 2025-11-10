import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useAuthStore } from '@/stores/authStore';
import { Equipment, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Download, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { generateQRCode, downloadQRCode } from '@/lib/qrcode';
import { toast } from 'sonner';

export default function EquipmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { equipment, loading, fetchEquipment } = useEquipmentStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    let filtered = equipment;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        eq =>
          eq.name.toLowerCase().includes(searchLower) ||
          eq.serialNo.toLowerCase().includes(searchLower) ||
          eq.make.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(eq => eq.workingStatus === statusFilter);
    }

    setFilteredEquipment(filtered);
  }, [equipment, search, statusFilter]);

  const canAddEquipment = user?.role === UserRole.PRINCIPAL || user?.role === UserRole.HOD;

  const handleDownloadQR = async (eq: Equipment) => {
    try {
      const qrDataURL = await generateQRCode(eq.qrCode);
      downloadQRCode(qrDataURL, `${eq.serialNo}-QR`);
      toast.success('QR code downloaded');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all equipment across labs
          </p>
        </div>
        {canAddEquipment && (
          <Button onClick={() => navigate(ROUTES.EQUIPMENT_CREATE)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, serial number, or make..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="WORKING">Working</SelectItem>
              <SelectItem value="NOT_WORKING">Not Working</SelectItem>
              <SelectItem value="REPAIRABLE">Repairable</SelectItem>
              <SelectItem value="TO_BE_SCRAPPED">To Be Scrapped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Equipment Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Serial No.</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>In-Charge</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No equipment found
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map(eq => (
                <TableRow key={eq.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{eq.name}</div>
                      <div className="text-sm text-muted-foreground">{eq.make}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{eq.serialNo}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{eq.lab?.name}</div>
                      <div className="text-sm text-muted-foreground">{eq.lab?.department?.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={eq.workingStatus} type="equipment" />
                  </TableCell>
                  <TableCell>{formatDate(eq.purchaseDate)}</TableCell>
                  <TableCell>{formatCurrency(eq.cost)}</TableCell>
                  <TableCell>{eq.facultyInCharge?.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(ROUTES.EQUIPMENT_DETAILS(eq.id))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadQR(eq)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Info */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredEquipment.length} of {equipment.length} equipment
      </div>
    </div>
  );
}
