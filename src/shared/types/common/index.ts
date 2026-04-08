/* =======================
   Common Types Index
   ======================= */

// Export common entity types
export * from './entities.types';

// Export any new common types here
export interface EntityWithId {
  id: string | number;
}

export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletableEntity {
  isDeleted?: boolean;
  deletedAt?: string;
}
