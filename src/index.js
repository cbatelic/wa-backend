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

app.post('/terrain', async (req, res) => {
  let data = req.body;
  //postovi datum i vrijeme posta
  data.posted_at = new Date().getTime();


  delete data._id;
  let check = checkAttributesTerrain(data)
  if(!check){
          res.json({
          status: 'fail',
         reason: 'incomplete post',
      });
      return;
  }

  let db = await connect();
  let result = await db.collection("terrain").insertOne(data);

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

//dohvaćanje svih postova
app.get ('/terrain', async (req , res) => {
  let db = await connect();
  

  let selekcija = {};


  let cursor = await db.collection('terrain').find(selekcija).sort( { posted_at: -1 });
  let results = await cursor.toArray();

  res.json(results);
});

app.get('/terrain/:terrainId', async (req, res)=>{ //dinamicka ruta
  let jobId = req.params.jobId //dohvat jednog dokumenta sa tocnim id-em
  let db = await connect();

  let doc = await db.collection("terrain").findOne({_id: mongo.ObjectId(terrainId)});
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


app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);

