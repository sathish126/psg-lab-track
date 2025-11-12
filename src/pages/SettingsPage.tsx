import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ROLE_LABELS } from '@/lib/utils/constants';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [equipmentAlerts, setEquipmentAlerts] = useState(true);
  const [verificationReminders, setVerificationReminders] = useState(true);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleProfileUpdate = () => {
    if (!profileData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    // Update user data in store (frontend only)
    const updatedUser = { ...user!, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
  };

  const handleAvatarUpload = () => {
    toast.info('Avatar upload coming soon!');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Settings' }]} />
      
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={handleAvatarUpload}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={user.department?.name || 'N/A'} disabled className="bg-muted" />
                </div>
              </div>

              <Button onClick={handleProfileUpdate}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive verification reminders via email</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled');
                  }}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Equipment Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified about equipment issues</p>
                </div>
                <Switch 
                  checked={equipmentAlerts}
                  onCheckedChange={(checked) => {
                    setEquipmentAlerts(checked);
                    toast.success(checked ? 'Equipment alerts enabled' : 'Equipment alerts disabled');
                  }}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Verification Reminders</p>
                  <p className="text-sm text-muted-foreground">Receive reminders for pending verifications</p>
                </div>
                <Switch 
                  checked={verificationReminders}
                  onCheckedChange={(checked) => {
                    setVerificationReminders(checked);
                    toast.success(checked ? 'Verification reminders enabled' : 'Verification reminders disabled');
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how PSG Track looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      setTheme('light');
                      toast.success('Light theme enabled');
                    }}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      setTheme('dark');
                      toast.success('Dark theme enabled');
                    }}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => {
                      setTheme('system');
                      toast.success('System theme enabled');
                    }}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
