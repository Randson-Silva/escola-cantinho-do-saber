import { Request, Response, Router } from 'express';
import { inject, injectable } from 'tsyringe';
import {
  ADDRESS_REPOSITORY_TOKEN,
  IAddressRepository,
} from '../../../../domain/application/repositories/address.repository';
import { AddressEntity } from '../../../../domain/enterprise/entities/address.entity';

@injectable()
export class CreateAddressController {
  public router: Router;

  constructor(
    @inject(ADDRESS_REPOSITORY_TOKEN)
    private readonly addressRepository: IAddressRepository,
  ) {
    this.router = Router();
    this.router.post('/addresses', this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { street, number, district, complement } = req.body;

    const address = AddressEntity.create({ street, number, district, complement });
    await this.addressRepository.create(address);

    return res.status(201).json({
      id: address.id.toString(),
      street: address.street,
      number: address.number,
      district: address.district,
      complement: address.complement,
    });
  }
}
