import { Address, Student, Guardian } from '@prisma/client';

export type AddressSchema = Address & {
  students?: Student[];
  guardians?: Guardian[];
};
