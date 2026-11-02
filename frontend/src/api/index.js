import { createCrudApi } from './createCurd';

export const scheduleApi = createCrudApi('/schedules');
export const taskApi = createCrudApi('/tasks');
export const attendanceApi = createCrudApi('/attendance');
export const callSheetApi = createCrudApi('/call-sheets');
export const locationApi = createCrudApi('/locations');

export const deliveryApi = createCrudApi('/deliveries');
export const approvalApi = createCrudApi('/approvals');
export const notificationApi = createCrudApi('/notifications');
export const ottApi = createCrudApi('/ott-publishing');