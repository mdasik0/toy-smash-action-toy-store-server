const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llfgq6f.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const subCategoryCollection = client
    .db("toyStore")
    .collection("subCategory");
    const allToysCollection = client.db("toyStore").collection("allToys");
    //-----------------------------------
    //         SubCategory
    //-----------------------------------

    // get all subcategory data
    app.get("/subCategory", async (req, res) => {
      const cursor = subCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // find data by id 
    app.get("/subCategory/:id", async (req, res) => {
      const id = req.params.id;
      const querry = { _id: new ObjectId(id) };
      const result = await subCategoryCollection.findOne(querry);
      res.send(result);
    });
    //-----------------------------------
    //            All Toys
    //-----------------------------------

    // for sorting by price
    app.get("/allToys", async (req, res) => {
      const sortBy = req.query.sortBy; 
      const cursor = allToysCollection.find().sort({ [sortBy]: 1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // add a toy
    app.post("/allToys", async (req, res) => {
      const toy = req.body;
      const result = await allToysCollection.insertOne(toy);
      res.send(result);
      // console.log(toy)
    });
    
    // for searching data
    app.get("/allToys/:name", async (req, res) => {
      let query = {};
      const name = req.params.name;
      if (name) {
        query = { name: name };
      }
      console.log(name);
      const result = await allToysCollection.find(query).toArray();
      res.send(result);
    });

    //-----------------------------------
    //            My Toys
    //-----------------------------------

    // get all data
    app.get("/singleData", async (req, res) => {
      const cursor = allToysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // find Single Data by _id
    app.get("/singleData/:id", async (req, res) => {
      const id = req.params.id;
      const querry = { _id: new ObjectId(id) };
      const result = await allToysCollection.findOne(querry);
      res.send(result);
    });

    // for updating data
    app.put("/singleData/:id", async(req,res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data)
      const filter = {_id : new ObjectId(id)};
      const options = {upsert : true}
      const updatedToy = {
        $set : {
          quantity: data.quantity,
          price: data.price,
          description: data.description
        }
      }
      const result = await allToysCollection.updateOne(filter,updatedToy,options)
      res.send(result)
    })
    // data fetch by email address
    app.get("/myToys/:id", async (req, res) => {
      let query = {};
      const id = req.params.id;
      if (id) {
        query = { email: id };
      }
      console.log(id);
      const result = await allToysCollection.find(query).toArray();
      res.send(result);
    });
    

    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("toy store is running");
});

app.listen(port, () => {
  console.log(`server is running on PORT=${port}`);
});
