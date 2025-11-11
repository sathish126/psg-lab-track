import { useState, useEffect } from 'react';
import { verificationApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [verificationCounts, setVerificationCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    try {
      const counts = await verificationApi.getMonthlyStatus(
        currentDate.getMonth(),
        currentDate.getFullYear()
      );
      setVerificationCounts(counts);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getActivityLevel = (count: number): string => {
    if (count === 0) return 'bg-muted';
    if (count <= 2) return 'bg-chart-3/30';
    if (count <= 5) return 'bg-chart-2/50';
    return 'bg-chart-2';
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const count = verificationCounts[day] || 0;
    days.push(
      <div
        key={day}
        className={cn(
          'aspect-square rounded-lg p-2 border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors',
          getActivityLevel(count)
        )}
      >
        <span className="text-sm font-medium">{day}</span>
        {count > 0 && (
          <span className="text-xs text-muted-foreground mt-1">{count}</span>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Calendar' }]} />
      
      <div>
        <h1 className="text-3xl font-bold">Verification Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Monthly overview of verification activity
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-muted border" />
              <span className="text-sm">No activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-chart-3/30 border" />
              <span className="text-sm">Low (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-chart-2/50 border" />
              <span className="text-sm">Medium (3-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-chart-2 border" />
              <span className="text-sm">High (6+)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
