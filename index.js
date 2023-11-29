const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("This is the server of MEDIFAX Website");
});
//---------------------------------

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.y6otyph.mongodb.net/?retryWrites=true&w=majority`;
// const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.y6otyph.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const TestCollection = client.db('DiagnoDB').collection('Tests')
    const UsersCollection = client.db('DiagnoDB').collection('Users')
    const BookingCollection = client.db('DiagnoDB').collection('Booked');
    const UpozilasCollection = client.db('DiagnoDB').collection('Upozilas');
    const DistrictsCollection = client.db('DiagnoDB').collection('Districts');

    app.get('/tests', async(req, res) => {
        const result = await TestCollection.find().toArray();
        res.send(result);
    })
    app.get('/tests/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
        const result = await TestCollection.findOne(query);
        res.send(result);
    })
    app.get('/districts', async(req, res) => {
      const result = await DistrictsCollection.find().toArray();
      res.send(result)
    })
    app.get('/upozilas', async(req, res) => {
      const result = await UpozilasCollection.find().toArray();
      res.send(result)
    })
    app.get('/users', async(req, res) => {
      const result = await UsersCollection.find().toArray();
      res.send(result)
    })
    app.get('/single/user', async(req, res) => {
      let query = {};
      const email = req?.query?.email;
      if(email){
        query = { email: email};
      }
      const result = await UsersCollection.findOne(query)
      res.send(result)
    })
    app.get('/booked', async(req, res) => {
      let query = {} 
      const email = req?.query?.email;
      if(email){
        query = {email: email}
      }
      const result = await BookingCollection.find(query).toArray();
      res.send(result);
    })
    app.post('/booked', async(req, res) => {
      const Test = req.body;
      const result = await BookingCollection.insertOne(Test)
      res.send(result);
    })
    app.post('/users', async(req, res) => {
      const user = req.body;
      const result = await UsersCollection.insertOne(user);
      res.send(result);
    })

    app.put('/booked', async(req, res) => {
      let query = {};
      let updatedItem = {};
      if (req.query.id) {
        query = { _id: new ObjectId(req.query.id) };
        updatedItem = { $inc: { available_slots: -1 }};
      }
      const result = await TestCollection.findOneAndUpdate(query, updatedItem);
      res.send(result);
    })
    app.put("/user", async (req, res) => {
      const id = req.query.id;
      const user = req.body;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const UpdatedUser = {
        $set: {
          name: user.name,
          email: user.email,
          blood_group: user.blood_group,
          district: user.district,
          upozila: user.upozila,
          image: user.image
        },
      };
      const result = await UsersCollection.updateOne(query, UpdatedUser, option);
      res.send(result);
    });
    app.put("/admin/users", async(req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
       const admin = 'admin';
       const UpdateRole = {
        $set: {
          role: admin
        }
       }
       const result = await UsersCollection.updateOne(query, UpdateRole, option);
       res.send(result)
    })
    app.delete("/booked", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const result = await BookingCollection.deleteOne(query);
      res.send(result);
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//---------------------------------

app.listen(port, () => {
  console.log(`The Server Of MEDIFAX Website is Running on [${port}] Port`);
});
