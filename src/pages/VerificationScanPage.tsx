import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { equipmentApi, verificationApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Equipment, EquipmentStatus, VerificationStatus } from '@/types';
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
import { QrCode, Camera, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/utils/constants';

export default function VerificationScanPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scanning, setScanning] = useState(false);
  const [scannedEquipment, setScannedEquipment] = useState<Equipment | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    physicalPresence: 'true',
    workingStatus: EquipmentStatus.WORKING,
    status: VerificationStatus.VERIFIED,
    remarks: '',
  });

  const startScanner = async () => {
    try {
      const qrCodeScanner = new Html5Qrcode('qr-reader');
      setHtml5QrCode(qrCodeScanner);

      await qrCodeScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // QR code scanned
          await handleQRCodeScanned(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );

      setScanning(true);
    } catch (error) {
      console.error('Failed to start scanner:', error);
      toast.error('Failed to start camera. Please allow camera access.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
        setScanning(false);
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
  };

  const handleQRCodeScanned = async (qrCode: string) => {
    try {
      const equipment = await equipmentApi.getByQRCode(qrCode);
      setScannedEquipment(equipment);
      setFormData({
        ...formData,
        workingStatus: equipment.workingStatus,
      });
      toast.success('Equipment found!');
    } catch (error) {
      toast.error('Equipment not found');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scannedEquipment || !user) return;

    try {
      await verificationApi.create({
        equipmentId: scannedEquipment.id,
        verifiedById: user.id,
        status: formData.status,
        physicalPresence: formData.physicalPresence === 'true',
        workingStatus: formData.workingStatus,
        remarks: formData.remarks,
        latitude: 11.0168, // Mock GPS
        longitude: 76.9558,
      });

      toast.success('Verification submitted successfully');
      setScannedEquipment(null);
      setFormData({
        physicalPresence: 'true',
        workingStatus: EquipmentStatus.WORKING,
        status: VerificationStatus.VERIFIED,
        remarks: '',
      });
      
      // Optionally navigate back
      // navigate(ROUTES.VERIFICATION);
    } catch (error) {
      toast.error('Failed to submit verification');
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [html5QrCode]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">QR Code Scanner</h1>
        <p className="text-muted-foreground mt-1">
          Scan equipment QR codes to verify their status
        </p>
      </div>

      {!scannedEquipment ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                id="qr-reader" 
                ref={scannerRef}
                className="w-full rounded-lg overflow-hidden bg-black"
                style={{ minHeight: scanning ? '400px' : '0' }}
              />
              
              {!scanning && (
                <div className="text-center py-12">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click the button below to start scanning QR codes
                  </p>
                  <Button onClick={startScanner} size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Start Camera
                  </Button>
                </div>
              )}

              {scanning && (
                <Button onClick={stopScanner} variant="destructive" className="w-full">
                  Stop Scanning
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Equipment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Equipment Scanned
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-lg">{scannedEquipment.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-mono">{scannedEquipment.serialNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lab</p>
                  <p>{scannedEquipment.lab?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Physical Presence *</Label>
                  <RadioGroup 
                    value={formData.physicalPresence}
                    onValueChange={(value) => setFormData({ ...formData, physicalPresence: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="present-yes" />
                      <Label htmlFor="present-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="present-no" />
                      <Label htmlFor="present-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workingStatus">Working Status *</Label>
                  <Select 
                    value={formData.workingStatus}
                    onValueChange={(value) => setFormData({ ...formData, workingStatus: value as EquipmentStatus })}
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
                    onValueChange={(value) => setFormData({ ...formData, status: value as VerificationStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="MISSING">Missing</SelectItem>
                      <SelectItem value="DAMAGED">Damaged</SelectItem>
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

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Submit Verification
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setScannedEquipment(null)}
                  >
                    Scan Another
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
