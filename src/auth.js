import mongo from "mongodb";
import connect from './db.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

let connection_string = "mongodb+srv://admin:admin@cluster0.hwnki.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let client = new mongo.MongoClient(connection_string, {
useNewUrlParser: true,
useUnifiedTopology: true
});

( async () =>{
let db = await connect();
await db.collection("user").createIndex({email: 1}, {unique: true});
})();

export default {
   async registerUser(userData){
        console.log( 'Dobrodošli', userData);
        let db = await connect();

        let doc = {
            email: userData.email,
            password: await bcrypt.hash(userData.password, 6),
            name: userData.name,
            surname: userDate.surname
        };
        try {
           let result = await db.collection("user").insertOne(doc);
           if(result && result.inesrtedId)
               return result.insertedId; 
        }
        catch(e){
            if(e.name == "MongoError" && e.code == 11000){
                throw new Error("Korisnik sa mailom: " + userData.email + " već postoji")
            }
           console.error(e);
           console.log(error)
        }

    },
    
    async authenticateuser(email, password){
        let db = await connect()
        let user = await db.collection("user").findOne({email: email})
        if(user && user.password && (await bcrypt.compare(password, user.password))){
            delete user.password
            let token = jwt.sign(user, process.env.JWT_SECRET, {
                algorithm : "HS512",
                expiresIn: "1 week"
            }) 
            return{
               token,
               email:user.email,
               password:user.password,
               name: user.name,
               surname: user.surname,
            }
        }
        else{
            throw new Error("cannot authenticate")
        }
        }
    }