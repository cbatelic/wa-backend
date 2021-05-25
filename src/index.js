import express from 'express';
import cors from 'cors';
import data from './store';
import connect from './db.js'
import mongo from 'mongodb'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.json('Home page!');
  });

app.post('/users', (req, res) => res.json(data.users));

app.get('/users', (req, res) => res.json(data.users));

app.post('/terrain', (req, res) => {
    res.json({});
  });

app.get('/terrain', async (req, res) => {
  let db = await connect() // pristup db objektu
  let cursor = await db.collection("terrain").find()
  let results = await cursor.toArray()
  res.json(results)
  });

app.get('/terrain/categories', (req, res) => {
    res.json(data.categories);
  });

app.get('/terrain/categories/termin', (req, res) => {
    res.json(data.termin);
  });

app.post('/terrain/categories/termin/teamReg', (req, res) => {
    res.json({});
  });

app.get('/terrain/categories/termin/teamReg', (req, res) => {
    res.json(data.team);
  });

app.post('/teams', (req, res) => {
    res.json({});
  });

app.get('/teams', (req, res) => {
    res.json({});
  });

app.post('/messages', (req, res) => {
    res.json({});
  });

app.get('/messages', (req, res) => {
    res.json({});
  });

app.get('/search', (req, res) => {
    res.json({});
  });


app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);