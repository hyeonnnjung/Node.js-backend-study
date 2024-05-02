const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://cathy2750:QMRBn85XxMhuRs8e@cluster0.psrg7y1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

async function run(){
    await client.connect();
    const adminDB = client.db('test').admin();
    const listDatabases = await adminDB.listDatabases();
    console.log(listDatabases);
    return "OK";
}

run()
    .then(console.log)
    .catch(console.error)
    .finally(()=> client.close());
