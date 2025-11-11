import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useAuthStore } from '@/stores/authStore';
import { Equipment, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Download, QrCode as QrCodeIcon } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { generateQRCode, downloadQRCode } from '@/lib/qrcode';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function EquipmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedEquipment, fetchEquipmentById, deleteEquipment, loading } = useEquipmentStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchEquipmentById(id);
    }
  }, [id, fetchEquipmentById]);

  useEffect(() => {
    if (selectedEquipment) {
      generateQRCode(selectedEquipment.qrCode).then(setQrCodeUrl);
    }
  }, [selectedEquipment]);

  const canEdit = user?.role === UserRole.PRINCIPAL || user?.role === UserRole.HOD;
  const canDelete = user?.role === UserRole.PRINCIPAL;

  const handleDelete = async () => {
    if (id) {
      try {
        await deleteEquipment(id);
        navigate(ROUTES.EQUIPMENT);
      } catch (error) {
        // Error handled in store
      }
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl && selectedEquipment) {
      downloadQRCode(qrCodeUrl, `${selectedEquipment.serialNo}-QR`);
      toast.success('QR code downloaded');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!selectedEquipment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Equipment not found</p>
        <Button onClick={() => navigate(ROUTES.EQUIPMENT)} className="mt-4">
          Back to Equipment List
        </Button>
      </div>
    );
  }

  const eq = selectedEquipment;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Equipment', href: ROUTES.EQUIPMENT },
        { label: eq.name }
      ]} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.EQUIPMENT)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{eq.name}</h1>
            <p className="text-muted-foreground mt-1">Serial: {eq.serialNo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" onClick={() => navigate(ROUTES.EQUIPMENT_EDIT(eq.id))}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the equipment
                    record and all associated verification history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="mt-1 font-medium">{eq.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Make</p>
                <p className="mt-1 font-medium">{eq.make}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                <p className="mt-1 font-mono">{eq.serialNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Model Number</p>
                <p className="mt-1 font-mono">{eq.modelNo || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                <p className="mt-1 font-medium">{formatDate(eq.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost</p>
                <p className="mt-1 font-medium">{formatCurrency(eq.cost)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funding Source</p>
                <p className="mt-1 font-medium">{eq.fundingSource}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Page/Serial</p>
                <p className="mt-1 font-medium">{eq.stockPageNo} / {eq.stockSerialNo}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lab</p>
                <p className="mt-1 font-medium">{eq.lab?.name}</p>
                <p className="text-sm text-muted-foreground">{eq.lab?.department?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="mt-1 font-medium">Block {eq.block}, Hall {eq.hallNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Working Status</p>
                <div className="mt-1">
                  <StatusBadge status={eq.workingStatus} type="equipment" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faculty In-Charge</p>
                <p className="mt-1 font-medium">{eq.facultyInCharge?.name}</p>
              </div>
              {eq.remarks && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                  <p className="mt-1">{eq.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification History */}
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              {eq.verifications && eq.verifications.length > 0 ? (
                <div className="space-y-4">
                  {eq.verifications.slice(0, 5).map((verification) => (
                    <div key={verification.id} className="flex items-start gap-4 border-l-2 border-primary pl-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={verification.status} type="verification" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(verification.verifiedAt)}
                          </span>
                        </div>
                        <p className="text-sm">
                          Verified by <span className="font-medium">{verification.verifiedBy?.name}</span>
                        </p>
                        {verification.remarks && (
                          <p className="text-sm text-muted-foreground mt-1">{verification.remarks}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No verification history available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCodeIcon className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCodeUrl} alt="Equipment QR Code" className="w-full" />
                </div>
              )}
              <Button onClick={handleDownloadQR} className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Code: {eq.qrCode}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
