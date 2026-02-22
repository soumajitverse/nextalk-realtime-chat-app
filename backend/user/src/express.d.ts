import "express";

// Type Declaration Merging (more specifically Module / Global Augmentation in TypeScript)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};
