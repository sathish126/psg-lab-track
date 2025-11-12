import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useAuthStore } from '@/stores/authStore';
import { Equipment, UserRole, EquipmentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Search, Download, Eye, FileDown } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { generateQRCode, downloadQRCode } from '@/lib/qrcode';
import { exportEquipmentToCSV } from '@/lib/utils/export';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/Breadcrumb';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function EquipmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { equipment, loading, fetchEquipment, bulkUpdateEquipment, bulkDeleteEquipment } = useEquipmentStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0 
      ? filteredEquipment.filter(eq => selectedIds.includes(eq.id))
      : filteredEquipment;
    exportEquipmentToCSV(dataToExport);
    toast.success('Equipment data exported');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredEquipment.map(eq => eq.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkStatusChange = async (status: EquipmentStatus) => {
    try {
      await bulkUpdateEquipment(selectedIds, { workingStatus: status });
      setSelectedIds([]);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteEquipment(selectedIds);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handled in store
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
      <Breadcrumb items={[{ label: 'Equipment' }]} />
      
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
          <div className="flex gap-2">
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
            <Button variant="outline" size="icon" onClick={handleExportCSV}>
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={() => setShowDeleteConfirm(true)}
        />
      )}

      {/* Equipment Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
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
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No equipment found
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map(eq => (
                <TableRow key={eq.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(eq.id)}
                      onCheckedChange={(checked) => handleSelectOne(eq.id, checked as boolean)}
                    />
                  </TableCell>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleBulkDelete}
        title="Delete Equipment"
        description={`Are you sure you want to delete ${selectedIds.length} equipment item(s)? This action cannot be undone.`}
      />
    </div>
  );
}
