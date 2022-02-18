import express from 'express';
import cors from 'cors';
import data from './store';
import connect from './db.js'
import mongo from 'mongodb';
import auth from './auth.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express()
const port = 3000

app.use(cors())
app.use(express.json());

app.use("/api/private", auth.permit("admin"));

app.post("/", (req, res) => {
  console.log("daa");
  res.json({ status: "ok" });
}),
  app.get("/tajna", [auth.verify], (req, res) => {
    res.json({ message: "Tajna " + req.jwt.email });
  });

// app.post('/terrain', (req, res) => {
//   let data = req.body;

//   // ovo inače radi baza (autoincrement ili sl.), ali čisto za primjer
//   data.id = 1 + storage.terrains.reduce((max, el) => Math.max(el.id, max), 0);

//   // dodaj u našu bazu (lista u memoriji)
//   storage.terrains.push(data);

//   // vrati ono što je spremljeno
//   res.json(data); // vrati podatke za referencu
// });



// admin
app.get("/admin", [auth.verify], auth.permit("admin"), async (req, res) => {
  let db = await connect();

  let cursor = await db.collection("users").find();
  let result = await cursor.toArray();

  res.json(result);
});

app.get(
  "/admin/:email",
  [auth.verify],
  auth.permit("admin"),
  async (req, res) => {
    let db = await connect();

    let doc = await db.collection("users").findOne({ role: "admin" });
    //console.log(doc);

    res.json(doc);
  }
);

app.post('/terrain', async (req, res) => {
  let data = req.body;
  //postovi datum i vrijeme posta
  data.posted_at = new Date().getTime();

  let db = await connect();
  let result = await db.collection("terrains").insertOne(data);

  if(result && result.insertedCount ==1){
     res.json({
         status: 'success'
     });
  }
  else{
      res.json({
          status: 'fail',
      });
  }
});
app.post('/homeAdmin', async (req, res) => {
  let data = req.body;
  //postovi datum i vrijeme posta
  data.posted_at = new Date().getTime();

  let db = await connect();
  let result = await db.collection("booking").insertOne(data);

  if(result && result.insertedCount ==1){
     res.json({
         status: 'success'
     });
  }
  else{
      res.json({
          status: 'fail',
      });
  }
});
app.get ('/homeAdmin', async (req , res) => {
  let db = await connect();
  

  let selekcija = {};


  let cursor = await db.collection('booking').find(selekcija).sort( { posted_at: -1 });
  let results = await cursor.toArray();

  res.json(results);
});

app.get('/homeAdmin/:homeId', async (req, res)=>{ //dinamicka ruta
  let homeId = req.params.homeId //dohvat jednog dokumenta sa tocnim id-em
  let db = await connect();

  let doc = await db.collection("booking").findOne({_id: mongo.ObjectId(homeId)});
  console.log(doc)
  res.json(doc)
});

//dohvaćanje svih postova
app.get ('/terrain', async (req , res) => {
  let db = await connect();
  

  let selekcija = {};


  let cursor = await db.collection('terrains').find(selekcija).sort( { posted_at: -1 });
  let results = await cursor.toArray();

  res.json(results);
});

app.get('/terrain/:terrainId', async (req, res)=>{ //dinamicka ruta
  let terrainId = req.params.terrainId //dohvat jednog dokumenta sa tocnim id-em
  let db = await connect();

  let doc = await db.collection("terrains").findOne({_id: mongo.ObjectId(terrainId)});
  console.log(doc)
  res.json(doc)
});


app.get('/', (req, res) => {
    res.json('Home page!');
  });

app.post('/user', async (req , res) =>{
    let user = req.body;
    let db = await connect();
    let result = await db.collection('user').insertOne(user);
    
    if (result.insertedCount == 1) {
        res.send({
            status: 'success',
            id: result.insertedId,
        });
    } 
    else {
        res.send({
            status: 'fail',
        });
    }

    res.json({
        id:  id
    })

});

app.post('/auth', async (req, res) =>{
  let user = req.body;
  let email = user.email;
  let password = user.password;
  try{
     let result = await auth.authenticateuser(email, password);
     res.status(201).json(result);
  }
  catch (e){
      res.status(500).json({error: e.message})
      console.log(error)
  }
})
app.patch('/user', [auth.verify], async (req, res) => {
  let changes = req.body;
  let email = req.jwt.email;

  if (changes.new_password && changes.old_password) {
    let result = await auth.change_Password(
      email,
      changes.old_password,
      changes.new_password
    );

    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: 'Cannot change your password!' });
    }
  } else {
    res.status(400).json({ error: 'Invalid inquiry!' });
  }
});


app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);

