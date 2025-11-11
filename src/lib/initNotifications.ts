import { useNotificationStore } from '@/stores/notificationStore';

export const initializeDemoNotifications = () => {
  const { addNotification, notifications } = useNotificationStore.getState();
  
  // Only add demo notifications if store is empty
  if (notifications.length === 0) {
    // Add some demo notifications
    addNotification({
      type: 'info',
      title: 'Welcome to PSG Track',
      message: 'Your equipment tracking system is ready to use. Start by scanning QR codes or adding equipment.',
    });
    
    addNotification({
      type: 'warning',
      title: 'Pending Verifications',
      message: '15 equipment items need verification this month. Click to view list.',
      link: '/verification',
    });
    
    addNotification({
      type: 'success',
      title: 'System Update',
      message: 'New features added: Enhanced reporting and bulk operations.',
    });
  }
};
