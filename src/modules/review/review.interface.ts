export interface ICreateReviewPayload {
  bookingId: string;
  rating: number; // 1 to 5
  comment?: string;
}