import { Request, Response, Router } from 'express';
import { inject, injectable } from 'tsyringe';
import { ADDRESS_REPOSITORY_TOKEN, AddressRepository } from '../../../../domain/application/repositories/address.repository';

@injectable()
export class FindAddressController {
  public router: Router;

  constructor(
    @inject(ADDRESS_REPOSITORY_TOKEN)
    private readonly addressRepository: AddressRepository
  ) {
    this.router = Router();
    this.router.get('/addresses/:id', this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const address = await this.addressRepository.findById(id);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    return res.json({
      id: address.id.toString(),
      street: address.street,
      number: address.number,
      district: address.district,
      complement: address.complement,
    });
  }
}
