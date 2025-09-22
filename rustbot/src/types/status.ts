// Shared Status enum for both bot and database
export enum Status {
  OPEN = 'open',
  CLOSED = 'closed',
  ACTIVE = 'active',
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  HIDDEN = 'hidden',
  CANCELLED = 'cancelled',
  PLANNED = 'planned',
  EXPIRED = 'expired',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  PROCESSING = 'processing'
}

export const AllStatuses = Object.values(Status);