// Carga el .env para tener DATABASE_URL y TEST_DATABASE_URL | Jest no lo carga solo
import 'dotenv/config';

import { Pool } from 'pg';

import { createPostgresPool } from '../../../../shared/database/postgresPool';
import { PostgresBookRepository } from './PostgresBookRepository';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const developmentDatabaseUrl = process.env.DATABASE_URL;

// Datos de ejemplo (datos de prueba en español).
const sampleBook = { title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0-306-40615-7', copies: 3 };

// Convierte una dirección en "servidor:puerto/base" para comparar BASES DE DATOS y no solo textos.
// Así "postgresql://..." y "postgres://..." apuntando a la misma base cuentan como iguales.
const toDatabaseKey = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`;
  } catch {
    return url;
  }
};

// Si no hay base de pruebas configurada, se omiten estas pruebas (y se avisa) para no tocar otra base.
if (!testDatabaseUrl) {
  console.warn('TEST_DATABASE_URL no está definida: se omiten las pruebas de integración de PostgreSQL.');
}
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase('PostgresBookRepository', () => {
  let pool: Pool;
  let repository: PostgresBookRepository;

  // Se ejecuta UNA vez antes de todas las pruebas: comprueba la protección y abre la conexión.
  beforeAll(() => {
    // PROTECCIÓN: estas pruebas vacían la tabla. Si apuntan a la base de desarrollo, se detiene todo.
    // Está aquí (y no en un "it") para que falle ANTES de que beforeEach borre algún dato.
    if (developmentDatabaseUrl && toDatabaseKey(developmentDatabaseUrl) === toDatabaseKey(testDatabaseUrl as string)) {
      throw new Error('TEST_DATABASE_URL debe ser distinta de DATABASE_URL: estas pruebas borran los datos.');
    }

    pool = createPostgresPool(testDatabaseUrl as string);
    repository = new PostgresBookRepository(pool);
  });

  // Se ejecuta antes de CADA prueba: vacía la tabla y reinicia el contador de ids en 1.
  beforeEach(async () => {
    await pool.query('TRUNCATE books RESTART IDENTITY');
  });

  // Se ejecuta UNA vez al final: cierra las conexiones para que Jest pueda terminar.
  afterAll(async () => {
    await pool?.end();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a book and assigns an id', async () => {
    const saved = await repository.save(sampleBook);

    // copies vuelve como NÚMERO (no como texto), gracias al mapeo del adaptador.
    expect(saved).toEqual({ id: 1, ...sampleBook });
  });

  it('assigns increasing ids and lists what was saved', async () => {
    await repository.save(sampleBook);
    const second = await repository.save({ ...sampleBook, title: 'Rayuela' });

    const list = await repository.findAll();

    expect(second.id).toBe(2);
    expect(list).toHaveLength(2);
    expect(list.map((book) => book.title)).toEqual(['Cien años de soledad', 'Rayuela']);
  });

  it('finds a book by id and returns undefined when it does not exist', async () => {
    const saved = await repository.save(sampleBook);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('returns undefined, and does not fail, for an id larger than an INTEGER column can hold', async () => {
    expect(await repository.findById(99999999999)).toBeUndefined();
  });

  it('keeps the ISBN exactly as it was written, including hyphens', async () => {
    const saved = await repository.save({ ...sampleBook, isbn: '0-306-40615-2' });

    expect((await repository.findById(saved.id))?.isbn).toBe('0-306-40615-2');
  });

  it('returns copies as a number, including zero', async () => {
    const saved = await repository.save({ ...sampleBook, copies: 0 });

    expect(saved.copies).toBe(0);
    expect((await repository.findById(saved.id))?.copies).toBe(0);
  });
});
