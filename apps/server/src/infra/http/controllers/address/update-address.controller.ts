import { Request, Response, Router } from 'express';
import { inject, injectable } from 'tsyringe';
import { ADDRESS_REPOSITORY_TOKEN, AddressRepository } from '../../../../domain/application/repositories/address.repository';
import { AddressEntity } from '../../../../domain/enterprise/entities/address.entity';
import { UniqueEntityId } from '../../../../core/entities/unique-entity-id';

@injectable()
export class UpdateAddressController {
  public router: Router;

  constructor(
    @inject(ADDRESS_REPOSITORY_TOKEN)
    private readonly addressRepository: AddressRepository
  ) {
    this.router = Router();
    this.router.put('/addresses/:id', this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { street, number, district, complement } = req.body;

    const existingAddress = await this.addressRepository.findById(id);
    if (!existingAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const updatedAddress = AddressEntity.create(
      { street, number, district, complement },
      new UniqueEntityId(id)
    );

    await this.addressRepository.update(updatedAddress);

    return res.status(200).json({
      message: 'Address updated successfully',
      address: {
        id: updatedAddress.id.toString(),
        street: updatedAddress.street,
        number: updatedAddress.number,
        district: updatedAddress.district,
        complement: updatedAddress.complement,
      },
    });
  }
}
