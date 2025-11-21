import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { AddressEntity } from '../../../enterprise/entities/address.entity';
import {
  IAddressRepository,
  ADDRESS_REPOSITORY_TOKEN,
} from '../../repositories/address.repository';

type CreateAddressUseCaseRequest = {
  street: string;
  number: string;
  district: string;
  complement?: string | null;
};

type CreateAddressUseCaseResponse = Either<CannotCreateError, { addressId: string }>;

@singleton()
export class CreateAddressUseCase {
  constructor(
    @inject(ADDRESS_REPOSITORY_TOKEN)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute({
    street,
    number,
    district,
    complement,
  }: CreateAddressUseCaseRequest): Promise<CreateAddressUseCaseResponse> {
    try {
      const addressEntity = AddressEntity.create({
        street,
        number,
        district,
        complement: complement ?? null,
      });

      const created = await this.addressRepository.create(addressEntity);

      if (!created) return fail(new CannotCreateError('Address'));

      return succeed({ addressId: addressEntity.id.toString() });
    } catch (error) {
      return fail(new CannotCreateError('Address'));
    }
  }
}
