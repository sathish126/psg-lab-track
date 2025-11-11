import { useEffect, useState } from 'react';
import { verificationApi } from '@/lib/api';
import { Verification } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/utils/formatters';
import { ROUTES } from '@/lib/utils/constants';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function VerificationListPage() {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const data = await verificationApi.getAll();
      setVerifications(data);
    } catch (error) {
      console.error('Failed to load verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter(v => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      v.equipment?.name.toLowerCase().includes(searchLower) ||
      v.verifiedBy?.name.toLowerCase().includes(searchLower) ||
      v.equipment?.serialNo.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Verification' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification History</h1>
          <p className="text-muted-foreground mt-1">
            Track and review equipment verification records
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.VERIFICATION_SCAN)}>
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by equipment name, serial number, or verifier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Verified By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Working Status</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVerifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No verifications found
                </TableCell>
              </TableRow>
            ) : (
              filteredVerifications.map(v => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{v.equipment?.name}</div>
                      <div className="text-sm text-muted-foreground">{v.equipment?.serialNo}</div>
                    </div>
                  </TableCell>
                  <TableCell>{v.equipment?.lab?.name}</TableCell>
                  <TableCell>{v.verifiedBy?.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={v.status} type="verification" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={v.workingStatus} type="equipment" />
                  </TableCell>
                  <TableCell className="text-sm">{formatDateTime(v.verifiedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredVerifications.length} of {verifications.length} verifications
      </div>
    </div>
  );
}
