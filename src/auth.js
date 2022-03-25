import dotenv from "dotenv";
dotenv.config();

import mongo from 'mongodb';
import connect from './db.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


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
            surname: userData.surname,
            role: 'admin'
        };
        console.log('doc:', doc)
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
        let user = await db.collection("user").findOne({email:email})
        console.log(user)
        
        if(bcrypt.compare(password, user.password)&&user.password===password){
            delete user.password
            let token = jwt.sign(user, process.env.JWT_SECRET, {
                algorithm : "HS512",
                expiresIn: "1 week"
            }) 
            
            return{
               token,
               email:user.email,
               name:user.name,
               surname:user.surname,
               role: user.role
            }
        }
       
        else{
            
            throw new Error("cannot authenticate")
            
        }
    },

     verify(req, res, next){
        try{
            let authorization = req.headers.authorization.split(' ');
            let type = authorization[0];
            let token = authorization[1]
            if(type !== "Bearer"){
                return res.status(401).send();
            }
            else{
            req.jwt =jwt.verify(token, process.env.JWT_SECRET);
            return next()
            }
        }
        catch(e){
           return res.status(401).send({Error: 'error'});
           
        }
    },
    // permit(...permittedRoles) {
    //     // return a middleware
        
    //     return (req, res, next) => {
    //       let authorization = req.headers.authorization.split(" ");
    //       let type = authorization[0];
    //       let token = authorization[1];
    //       let user = req.jwt;

    //       user = jwt.verify(token, process.env.JWT_SECRET);
    //         console.log(user)
          
    
    //       if (user && permittedRoles.includes(user.role)) {
    //           console.log(user)
    //         next(); //role is allowed, so continue on the next middleware
    //       } else {
    //         res.status(403).json({ message: "Forbidden" }); // user is forbidden
    //       }
    //     };
    //   },

      async changeUserPassword(email, old_password, new_password) {
		let db = await connect();
		let user = await db.collection("user").findOne({ email: email });
		if (
			user &&
			user.password &&
			(await bcrypt.compare(old_password, user.password))
		) 
        console.log(user)
        {
			let new_password_hashed = await bcrypt.hash(new_password, 8);
			let result = await db
				.collection("user")
				.updateOne(
					{ _id: user._id },
					{ 
                        $set: {
                             password: new_password_hashed,
                        },
                 }
				);
			return result.modifiedCount == 1;
		}
	},
    }