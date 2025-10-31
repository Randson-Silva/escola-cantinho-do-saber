import { Request, Response, Router } from 'express';
import { inject, injectable } from 'tsyringe';
import { ADDRESS_REPOSITORY_TOKEN, AddressRepository } from '../../../../domain/application/repositories/address.repository';

@injectable()
export class DeleteAddressController {
  public router: Router;

  constructor(
    @inject(ADDRESS_REPOSITORY_TOKEN)
    private readonly addressRepository: AddressRepository
  ) {
    this.router = Router();
    this.router.delete('/addresses/:id', this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const address = await this.addressRepository.findById(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await this.addressRepository.softDelete(id);
    return res.status(204).send(); // No Content
  }
}
