const { MongoClient } = require('mongodb');
const express = require('express');
const port = process.env.port || 5000;
const ObjectId = require('mongodb').ObjectId;
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());

async function run() {

    // mongo db uri

    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39aol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


    try {

        await client.connect();
        const database = client.db('groceryShop');
        const foodCollection = database.collection('foods');

        // get all food
        app.get('/foods', async (req, res) => {
            const foods = await foodCollection.find({}).toArray();
            res.send(foods);
        })

        // get single api
        app.get('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            res.send(await foodCollection.findOne(query));
        })

    }

    finally { }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("My server is running...");
})

app.listen(port, () => {
    console.log('My server is running');
})