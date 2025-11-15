import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [stats, setStats] = useState({
    totalEquipment: 0,
    verifiedThisMonth: 0,
    pendingVerification: 0,
    needsAttention: 0,
    verificationRate: '0%',
  });
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch all equipment
      const { data: equipment, error: eqError } = await supabase
        .from('equipment')
        .select('*, lab:labs(name, department:departments(code))');

      if (eqError) throw eqError;

      // Fetch recent verifications
      const { data: verifications, error: verifyError } = await supabase
        .from('verifications')
        .select('*, equipment:equipment(name, serial_no), verified_by:profiles(name)')
        .order('verified_at', { ascending: false })
        .limit(10);

      if (verifyError) throw verifyError;

      // Calculate stats
      const total = equipment?.length || 0;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const verifiedThisMonth = verifications?.filter(v => 
        new Date(v.verified_at) >= thisMonth
      ).length || 0;

      const working = equipment?.filter(eq => eq.working_status === 'WORKING').length || 0;
      const notWorking = equipment?.filter(eq => eq.working_status === 'NOT_WORKING').length || 0;
      const repairable = equipment?.filter(eq => eq.working_status === 'REPAIRABLE').length || 0;
      const toBeScrap = equipment?.filter(eq => eq.working_status === 'TO_BE_SCRAPPED').length || 0;
      
      const attention = equipment?.filter(eq => 
        eq.working_status !== 'WORKING' || !eq.physical_presence
      ) || [];

      setStats({
        totalEquipment: total,
        verifiedThisMonth,
        pendingVerification: total - (verifications?.length || 0),
        needsAttention: attention.length,
        verificationRate: total > 0 ? `${Math.round((working / total) * 100)}%` : '0%',
      });

      setStatusData([
        { name: 'Working', value: working, fill: 'hsl(var(--chart-2))' },
        { name: 'Not Working', value: notWorking, fill: 'hsl(var(--chart-4))' },
        { name: 'Repairable', value: repairable, fill: 'hsl(var(--chart-3))' },
        { name: 'To Be Scrapped', value: toBeScrap, fill: 'hsl(var(--muted-foreground))' },
      ]);

      setRecentVerifications(verifications || []);
      setNeedsAttention(attention);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="text-2xl font-bold">{stats.totalEquipment}</div>
            <p className="text-xs text-muted-foreground">Across all labs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.verifiedThisMonth}</div>
            <p className="text-xs text-muted-foreground">{stats.verificationRate} completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingVerification}</div>
            <p className="text-xs text-muted-foreground">Awaiting inspection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.needsAttention}</div>
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
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
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
            <CardDescription>Monthly verification progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Verifications"
                />
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
            <CardDescription>Latest equipment inspection records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVerifications.slice(0, 5).map((verification) => (
                <div key={verification.id} className="flex items-center gap-4 border-b pb-3 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {verification.equipment?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      By {verification.verified_by?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={verification.status} type="verification" />
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(verification.verified_at))}
                    </span>
                  </div>
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
                  className="flex items-center gap-4 border-b pb-3 last:border-0 cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2"
                  onClick={() => navigate(ROUTES.EQUIPMENT_DETAILS(equipment.id))}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{equipment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {equipment.lab?.name} • {equipment.lab?.department?.code}
                    </p>
                  </div>
                  <StatusBadge status={equipment.working_status} type="equipment" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
