import { Pool } from 'pg';

// Crea el pool de conexiones a partir de la cadena de conexión.
export const createPostgresPool = (connectionString: string): Pool => new Pool({ connectionString });
