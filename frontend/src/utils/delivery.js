import { isPastDate } from './helpers';

export const getDeliveryStatus = (item) =>
  item.status !== 'delivered' && isPastDate(item.dueDate) ? 'delayed' : item.status;