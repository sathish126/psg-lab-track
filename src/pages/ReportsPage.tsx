import { useEffect, useState } from 'react';
import { departmentApi, equipmentApi } from '@/lib/api';
import { Department, Equipment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, TrendingUp, Package, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptData, eqData] = await Promise.all([
        departmentApi.getAll(),
        equipmentApi.getAll(),
      ]);
      setDepartments(deptData);
      setEquipment(eqData);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentStats = (deptId: string) => {
    const deptEquipment = equipment.filter(eq => eq.lab?.departmentId === deptId);
    const working = deptEquipment.filter(eq => eq.workingStatus === 'WORKING').length;
    
    return {
      total: deptEquipment.length,
      working,
      percentage: deptEquipment.length > 0 ? Math.round((working / deptEquipment.length) * 100) : 0,
    };
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
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive equipment and verification analytics
          </p>
        </div>
        <Button>
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
              {equipment.filter(eq => eq.workingStatus === 'WORKING').length}
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
              {equipment.filter(eq => eq.workingStatus === 'REPAIRABLE').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((equipment.filter(eq => eq.workingStatus === 'WORKING').length / equipment.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Equipment in working condition</p>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Department-wise Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map(dept => {
              const stats = getDepartmentStats(dept.id);
              return (
                <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{dept.name}</h3>
                    <p className="text-sm text-muted-foreground">{dept.code}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Equipment</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Working</p>
                      <p className="text-xl font-bold text-success">{stats.working}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Health</p>
                      <p className="text-xl font-bold">{stats.percentage}%</p>
                    </div>
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
