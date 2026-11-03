// Supertest permite hacer peticiones HTTP a la app sin abrir un puerto.
import request from 'supertest';

// Importa la aplicación ya ensamblada.
import app from './app';

// Datos válidos de ejemplo (datos de prueba en español).
const validBook = {
  title: 'El amor en los tiempos del cólera',
  author: 'Gabriel García Márquez',
  isbn: '9780307389732',
  copies: 4,
};

// Crea un libro por HTTP y devuelve la respuesta (para obtener su id en las pruebas siguientes).
const createBook = async () => request(app).post('/books').send(validBook);

describe('POST /books', () => {
  it('creates a book and responds with 201', async () => {
    const response = await request(app).post('/books').send(validBook);

    // Verifica: 201, que contenga los datos enviados y que tenga un id asignado.
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(validBook);
    expect(response.body.id).toBeDefined();
  });

  it('responds with 400 and the message of the broken rule', async () => {
    const response = await request(app).post('/books').send({ ...validBook, isbn: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El ISBN no es válido');
  });

  it('responds with 400 when the body is empty', async () => {
    const response = await request(app).post('/books').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El título es obligatorio');
  });

  it('responds with 400 in JSON when the body is malformed', async () => {
    const response = await request(app).post('/books').set('Content-Type', 'application/json').send('{"title": ');

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});

describe('GET /books', () => {
  it('responds with 200 and an array', async () => {
    const response = await request(app).get('/books');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('includes the books that were created', async () => {
    const created = await createBook();

    const response = await request(app).get('/books');

    expect(response.body).toContainEqual(created.body);
  });
});

describe('GET /books/:id', () => {
  it('responds with 200 and the book', async () => {
    const created = await createBook();

    const response = await request(app).get(`/books/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(created.body);
  });

  it('responds with 404 when the book does not exist', async () => {
    const response = await request(app).get('/books/9999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Libro no encontrado');
  });

  it('responds with 400 when the id is not a number', async () => {
    const response = await request(app).get('/books/abc');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El identificador no es válido');
  });
});

describe('unknown routes', () => {
  it('responds with 404 in JSON', async () => {
    const response = await request(app).get('/unknown');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Ruta no encontrada');
  });
});
