import { DomainError } from '../../../shared/DomainError';
import { NotFoundError } from '../../../shared/NotFoundError';

import { InMemoryBookRepository } from '../adapters/persistence/InMemoryBookRepository';

import { BookService } from './BookService';

// Datos de ejemplo válidos que se reutilizan en las pruebas.
const validInput = { title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0-306-40615-7', copies: 3 };

// Crea un servicio nuevo con un repositorio vacío, para que cada prueba parta de cero.
const createService = (): BookService => new BookService(new InMemoryBookRepository());

describe('BookService', () => {
  it('creates a valid book and returns it with an id', async () => {
    const service = createService();

    const created = await service.create(validInput);

    expect(created).toEqual({ id: 1, ...validInput });
  });

  it('rejects an invalid book and does not save it', async () => {
    const service = createService();

    await expect(service.create({ ...validInput, isbn: '123' })).rejects.toThrow(DomainError);
    expect(await service.list()).toEqual([]);
  });

  it('lists the books that were created', async () => {
    const service = createService();

    await service.create(validInput);
    await service.create({ ...validInput, title: 'El amor en los tiempos del cólera' });

    expect(await service.list()).toHaveLength(2);
  });

  it('gets a book by id and throws NotFoundError when it does not exist', async () => {
    const service = createService();
    const created = await service.create(validInput);

    expect(await service.getById(created.id)).toEqual(created);
    await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    await expect(service.getById(999)).rejects.toThrow('Libro no encontrado');
  });
});
