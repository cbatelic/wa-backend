import mongo from "mongodb";

let connection_string = 'mongodb+srv://admin:admin@cluster0.hwnki.mongodb.net/test?retryWrites=true&w=majority';
let client = new mongo.MongoClient(connection_string, {
useNewUrlParser: true,
useUnifiedTopology: true
});
let db = null
// eksportamo Promise koji resolva na konekciju
export default () => {
return new Promise((resolve, reject) => {

if (db && client.isConnected()) {
resolve(db)
}
else {
client.connect(err => {
if (err) {
reject("Spajanje na bazu nije uspjelo:" + err);
}
else {
console.log("Database connected successfully!");
db = client.db("move&play");
resolve(db);
}
});
}
});
}