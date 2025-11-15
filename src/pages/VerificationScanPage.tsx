import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Camera, QrCode, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export default function VerificationScanPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedEquipment, setScannedEquipment] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    physicalPresence: true,
    workingStatus: 'WORKING',
    status: 'VERIFIED',
    remarks: '',
  });
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleQRCodeScanned,
        (error) => {
          // Ignore scan errors
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Failed to start scanner:', error);
      toast.error('Failed to start camera. Please allow camera access.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
  };

  const handleQRCodeScanned = async (qrCode: string) => {
    try {
      await stopScanner();
      
      // Fetch equipment by QR code
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*, lab:labs(name, department:departments(code))')
        .eq('qr_code', qrCode)
        .single();
      
      if (error) throw error;

      if (equipment) {
        setScannedEquipment(equipment);
        setFormData({
          physicalPresence: equipment.physical_presence,
          workingStatus: equipment.working_status,
          status: 'VERIFIED',
          remarks: '',
        });
        toast.success('Equipment found!');
      } else {
        toast.error('Equipment not found');
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Failed to process QR code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scannedEquipment || !profile) {
      toast.error('No equipment scanned or user not logged in');
      return;
    }

    try {
      // Get current location if available
      let latitude = null;
      let longitude = null;

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }

      const { error } = await supabase
        .from('verifications')
        .insert([{
          equipment_id: scannedEquipment.id,
          verified_by_id: profile.id,
          physical_presence: formData.physicalPresence,
          working_status: formData.workingStatus,
          status: formData.status,
          remarks: formData.remarks || null,
          latitude,
          longitude,
        }]);

      if (error) throw error;

      // Update equipment status
      await supabase
        .from('equipment')
        .update({
          physical_presence: formData.physicalPresence,
          working_status: formData.workingStatus,
        })
        .eq('id', scannedEquipment.id);

      toast.success('Verification submitted successfully');
      navigate(ROUTES.VERIFICATION);
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.message || 'Failed to submit verification');
    }
  };

  const handleScanAnother = () => {
    setScannedEquipment(null);
    setFormData({
      physicalPresence: true,
      workingStatus: 'WORKING',
      status: 'VERIFIED',
      remarks: '',
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Verification', href: ROUTES.VERIFICATION },
          { label: 'Scan QR Code' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold">Scan Equipment QR Code</h1>
        <p className="text-muted-foreground mt-1">
          Scan the QR code on equipment to verify and update its status
        </p>
      </div>

      {!scannedEquipment ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              id={scannerDivId}
              className={`${isScanning ? 'border-2 border-primary rounded-lg overflow-hidden' : 'hidden'}`}
            />
            
            {!isScanning && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Ready to scan</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Click the button below to start scanning QR codes
                </p>
                <Button onClick={startScanner}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              </div>
            )}

            {isScanning && (
              <Button variant="outline" onClick={stopScanner} className="w-full">
                Stop Scanner
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{scannedEquipment.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Make</Label>
                  <p className="font-medium">{scannedEquipment.make}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Serial No.</Label>
                  <p className="font-medium font-mono">{scannedEquipment.serial_no}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lab</Label>
                  <p className="font-medium">{scannedEquipment.lab?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Physical Presence *</Label>
                <RadioGroup
                  value={formData.physicalPresence.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, physicalPresence: value === 'true' })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="present" />
                    <Label htmlFor="present" className="font-normal cursor-pointer">
                      Present
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="absent" />
                    <Label htmlFor="absent" className="font-normal cursor-pointer">
                      Absent
                    </Label>
                  </div>
                </RadioGroup>
              </div>

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
                <Label htmlFor="status">Verification Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="NEEDS_ATTENTION">Needs Attention</SelectItem>
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
                  placeholder="Add any additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleScanAnother}>
              Scan Another
            </Button>
            <Button type="submit">
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit Verification
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
