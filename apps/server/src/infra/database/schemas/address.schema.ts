import { Address } from '@prisma/client';

export type AddressSchema = Address & {
  students?: { id: string }[];
  guardians?: { id: string }[];
};
