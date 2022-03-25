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

// app.use("/api/private", auth.permit("admin"));

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
// app.get("/homeAdmin", [auth.verify], auth.permit("admin"), async (req, res) => {
//   let db = await connect();

//   let cursor = await db.collection("users").find();
//   let result = await cursor.toArray();

//   res.json(result);
// });

// app.get(
//   "/homeAdmin/:email",
//   [auth.verify],
//   auth.permit("admin"),
//   async (req, res) => {
//     let db = await connect();

//     let doc = await db.collection("users").findOne({ role: "admin" });
//     //console.log(doc);

//     res.json(doc);
//   }
// );

app.post('/terrain', async (req, res) => {
  let data = req.body;
  console.log(data);
  //postovi datum i vrijeme posta
  data.posted_at = new Date().getTime();

  let db = await connect();
  let result = await db.collection("terrains").insertOne(data);

  if(result && result.insertedCount ==1){
    console.log("OK")
     res.status(200).json({
         status: 'success'
     });
  }
  else{
    console.log("Ne OK")

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
  // 
  let bookings = await db.collection('booking').find({}).sort( { posted_at: -1 }).toArray();
  

  
    // for(let doc of booking){
    //   let terrains = await db.collection('terrains').find(x => x._id == doc._terrainId).sort( { posted_at: -1 });;
    //   let terrain = await terrains.toArray();
    //   console.log(terrain);
    //   booking.push({
    //               // id: doc._id,
    //               terrainId: doc._terrainId,
    //               terrainName: terrain.terrainName,
    //               terrainCity: terrain.terrainCity,
    //               terrainCategories: terrain.terrainCategories,
    //               teamName: doc.teamName,
    //               userEmail: doc.userEmail,
    //               members: doc.members,
    //               note: doc.note,
    //               date: terrain.date,
    //               time: terrain.time,
    //   })
      
    // }

    let terrains = await db.collection('terrains').find({}).sort({ posted_at: -1 }).toArray();


    bookings.forEach(booking => {
      let terrain = terrains.find(x => x._id == booking.terrainId);
      booking.terrain = terrain;
    });
  res.json(bookings);

});


//dohvaćanje svih postova
app.get ('/terrain', async (req , res) => {
  let db = await connect();
  

  let selekcija = {};


  let cursor = await db.collection('terrains').find(selekcija).sort( { posted_at: -1 });
  let results = await cursor.toArray();

  res.json(results);
});

app.post('/usersQuestionsAdmin', async (req, res) => {
  let data = req.body;
  //postovi datum i vrijeme posta
  data.posted_at = new Date().getTime();

  let db = await connect();
  let result = await db.collection("questions").insertOne(data);

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

app.get ('/usersQuestionsAdmin', async (req , res) => {
  let db = await connect();
  

  let selekcija = {};


  let cursor = await db.collection('questions').find(selekcija).sort( { posted_at: -1 });
  let results = await cursor.toArray();

  res.json(results);
});

app.get('/usersQuestionsAdmin/:id', [auth.verify], async (req, res) => {
  let id = req.params.id;
  let db = await connect();

  let doc = await db.collection('questions').findOne({ _id: mongo.ObjectId(id) });
  res.json(doc);
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
  console.log(changes);
  console.log(email)

  if (changes.new_password && changes.old_password) {
    let result = await auth.changeUserPassword(
      email,
      changes.old_password,
      changes.new_password,
    );
  console.log(result)
    if (result) {
      res.status(201).send();
    } else {
      res.status(500).json({ error: 'Cannot change your password!' });
    }
  } else {
    res.status(400).json({ error: 'Invalid!' });
  }
});


app.listen(port, () =>
  console.log(`\n\n[DONE] Backend se vrti na http://localhost:${port}/\n\n`)
);

