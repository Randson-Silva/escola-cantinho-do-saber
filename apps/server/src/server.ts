import * as express from 'express';

const app = express();
app.use(express.json());

app.get('/', (_, res) => res.send('Server running!'));

app.listen(3000, () => console.log('🚀 Server listening on http://localhost:3000'));
