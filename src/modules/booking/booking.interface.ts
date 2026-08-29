
export interface ICreateBookingPayload {
  serviceId: string;
  scheduledAt: string; // ISO DateTime string
  address?: string;
  notes?: string;
}