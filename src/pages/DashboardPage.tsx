import { useEffect, useState } from 'react';
import { dashboardApi, equipmentApi, verificationApi } from '@/lib/api';
import { DashboardStats, Equipment, Verification } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/utils/constants';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<Verification[]>([]);
  const [needsAttention, setNeedsAttention] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, allEquipment, allVerifications] = await Promise.all([
        dashboardApi.getOverview(),
        equipmentApi.getAll(),
        verificationApi.getAll(),
      ]);

      setStats(statsData);
      setRecentVerifications(allVerifications.slice(0, 10));
      
      const attention = allEquipment.filter(eq => 
        eq.workingStatus !== 'WORKING' || !eq.physicalPresence
      );
      setNeedsAttention(attention);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusData = [
    { name: 'Working', value: 85, fill: 'hsl(var(--chart-2))' },
    { name: 'Not Working', value: 8, fill: 'hsl(var(--chart-4))' },
    { name: 'Repairable', value: 5, fill: 'hsl(var(--chart-3))' },
    { name: 'To Be Scrapped', value: 2, fill: 'hsl(var(--muted-foreground))' },
  ];

  const trendData = [
    { month: 'Jun', count: 45 },
    { month: 'Jul', count: 52 },
    { month: 'Aug', count: 61 },
    { month: 'Sep', count: 68 },
    { month: 'Oct', count: 72 },
    { month: 'Nov', count: 78 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of equipment tracking and verification status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEquipment || 0}</div>
            <p className="text-xs text-muted-foreground">Across all labs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats?.verifiedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.verificationRate} completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats?.pendingThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.needsAttentionCount || 0}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Status Distribution</CardTitle>
            <CardDescription>Overview of equipment working status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Trend</CardTitle>
            <CardDescription>Last 6 months verification activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} name="Verifications" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Verifications</CardTitle>
            <CardDescription>Latest equipment verification activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVerifications.slice(0, 5).map((verification) => (
                <div 
                  key={verification.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(ROUTES.EQUIPMENT_DETAILS(verification.equipmentId))}
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{verification.equipment?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      by {verification.verifiedBy?.name} • {formatRelativeTime(verification.verifiedAt)}
                    </p>
                  </div>
                  <StatusBadge status={verification.status} type="verification" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Equipment requiring immediate action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {needsAttention.slice(0, 5).map((equipment) => (
                <div 
                  key={equipment.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(ROUTES.EQUIPMENT_DETAILS(equipment.id))}
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{equipment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Serial: {equipment.serialNo} • {equipment.lab?.name}
                    </p>
                  </div>
                  <StatusBadge status={equipment.workingStatus} type="equipment" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
