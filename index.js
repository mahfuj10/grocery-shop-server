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
        const reviewCollection = database.collection('reviews');
        const cartCollection = database.collection('cart-products');

        // get all food
        app.get('/foods', async (req, res) => {
            const foods = await foodCollection.find({}).toArray();
            res.send(foods);
        })
        //post food
        app.get('/addproduct', async (req, res) => {
            const foods = await foodCollection.insertOne(req.body);
            res.send(foods);
        })

        // get single api
        app.get('/food/:id', async (req, res) => {
            const id = req.params.id;
            const options = {
                projection: { _id: 0 },
            };
            const query = { _id: ObjectId(id) };
            res.send(await foodCollection.findOne(query, options));
        });

        // get food api by category
        app.get('/foods/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category };
            res.send(await foodCollection.find(query).toArray());
        })
        // get food api by origin
        app.get('/products/:origin', async (req, res) => {
            const origin = req.params.origin;
            const query = { origin: origin };
            res.send(await foodCollection.find(query).toArray());
        })

        // get review api
        app.get('/productReviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { foodId: id };
            const review = await reviewCollection.find(query).toArray();
            res.send(review);
        });

        // get review api
        app.get('/reviews', async (req, res) => {
            const review = await reviewCollection.find({}).toArray();
            res.send(review);
        });

        // post review
        app.post('/review', async (req, res) => {
            const userReivew = req.body;
            res.send(await reviewCollection.insertOne(userReivew));
        });

        // add to cart
        app.post('/addToCart', async (req, res) => {
            const product = req.body;
            res.send(await cartCollection.insertOne(product));
        });

        // get user cart product api
        app.get('/myCartProducts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            res.send(await cartCollection.find(query).toArray());
        });

        // delete cart item
        app.delete('/deleteCartProduct/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = { _id: ObjectId(id) };
            res.send(await cartCollection.deleteOne(query));
        });
    }

    finally { }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("My server is running...");
})

app.listen(process.env.PORT || 5000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});