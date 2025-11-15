import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, TrendingUp, Package, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { exportEquipmentToCSV } from '@/lib/utils/export';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptRes, eqRes] = await Promise.all([
        supabase.from('departments').select('*'),
        supabase.from('equipment').select('*, lab:labs(*, department:departments(*))'),
      ]);

      if (deptRes.error) throw deptRes.error;
      if (eqRes.error) throw eqRes.error;

      setDepartments(deptRes.data || []);
      setEquipment(eqRes.data || []);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentStats = (deptId: string) => {
    const deptEquipment = equipment.filter(eq => eq.lab?.department?.id === deptId);
    const working = deptEquipment.filter(eq => eq.working_status === 'WORKING').length;
    
    return {
      total: deptEquipment.length,
      working,
      percentage: deptEquipment.length > 0 ? Math.round((working / deptEquipment.length) * 100) : 0,
    };
  };

  const handleExportReport = () => {
    exportEquipmentToCSV(equipment);
    toast.success('Report exported successfully');
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
      <Breadcrumb items={[{ label: 'Reports' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive equipment and verification analytics
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Overall Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipment.length}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {equipment.filter(eq => eq.working_status === 'WORKING').length}
            </div>
            <p className="text-xs text-muted-foreground">Operational equipment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Repair</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {equipment.filter(eq => eq.working_status === 'REPAIRABLE').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Working</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {equipment.filter(eq => eq.working_status === 'NOT_WORKING').length}
            </div>
            <p className="text-xs text-muted-foreground">Out of service</p>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Report */}
      <Card>
        <CardHeader>
          <CardTitle>Department-wise Equipment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map((dept) => {
              const stats = getDepartmentStats(dept.id);
              return (
                <div key={dept.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {stats.working} / {stats.total} Working
                      </p>
                      <p className="text-xs text-muted-foreground">{stats.percentage}% operational</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
