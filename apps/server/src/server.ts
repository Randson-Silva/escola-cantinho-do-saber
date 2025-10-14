import * as express from 'express';
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.EXPRESS_BACK_PORT ?? 3000;

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
