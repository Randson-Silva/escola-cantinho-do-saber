import { AddressEntity } from '../../../enterprise/entities/address.entity';
import { AddressRepository } from '../../repositories/address.repository';

export class CreateAddressUseCase {
  constructor(private readonly repo: AddressRepository) {}

  async execute(input: {
    street: string;
    number: string;
    district: string;
    complement?: string | null;
  }) {
    const address = AddressEntity.create(input);
    await this.repo.create(address);
    return { address };
  }
}
