import { InMemoryBookRepository } from './InMemoryBookRepository';

// Datos de ejemplo (datos de prueba en español).
const sampleBook = { title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0-306-40615-7', copies: 3 };

describe('InMemoryBookRepository', () => {
  it('starts empty when no initial books are given', async () => {
    const repository = new InMemoryBookRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a book, assigns increasing ids and lists them', async () => {
    const repository = new InMemoryBookRepository();

    const first = await repository.save(sampleBook);
    const second = await repository.save(sampleBook);

    expect(first).toEqual({ id: 1, ...sampleBook });
    expect(second.id).toBe(2);
    expect(await repository.findAll()).toHaveLength(2);
  });

  it('continues the ids after the highest initial id', async () => {
    const repository = new InMemoryBookRepository([{ id: 7, ...sampleBook }]);

    expect((await repository.save(sampleBook)).id).toBe(8);
  });

  it('finds a book by id and returns undefined when it does not exist', async () => {
    const repository = new InMemoryBookRepository();
    const saved = await repository.save(sampleBook);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('returns copies, so changing them does not change what is stored', async () => {
    const repository = new InMemoryBookRepository();
    const saved = await repository.save(sampleBook);

    // Se modifican las copias recibidas.
    const list = await repository.findAll();
    list[0].title = 'Título alterado';
    list.pop();
    saved.copies = 999;

    // Lo guardado sigue intacto.
    expect(await repository.findAll()).toEqual([{ id: 1, ...sampleBook }]);
  });
});
