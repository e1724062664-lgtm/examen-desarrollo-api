//Cargar las variables del archivo .env (debe ser lo PRIMERO, antes de importar la aplicación).
import 'dotenv/config';

import app from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, ()=>{
    console.log(`Server listening on http://localhost:${PORT}`);
});
