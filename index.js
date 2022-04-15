const { MongoClient } = require('mongodb');
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const stripe = require('stripe')('sk_test_51K93ltBcGooWtax9GkAGLr4DEmlZNpm6tUa0SLImClKgGZFpYehHv9XhvOAf5escrbFzko1UJ1bbecG02hdCCZZu00K0yXRB8H');
const cors = require('cors');
const port = process.env.port || 5000;

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
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');

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

        // stripe payment gatway
        app.post('/getclientsecretid', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
        });

        // store my order data
        app.post('/storeOrders', async (req, res) => {
            console.log(req.body)
            res.send(await ordersCollection.insertMany(req.body));
        });

        // get order all data
        app.get('/orders', async (req, res) => {
            res.send(await ordersCollection.find({}).toArray());
        })

        // get my order data
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            res.send(await ordersCollection.find(query).toArray());
        })

        // delete products from cart collection
        app.delete('/deletecartproducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            res.send(await cartCollection.deleteMany(query));
        });

        // add review 
        app.post('/addproductreivew', async (req, res) => {
            const id = req?.query?.foodId;
            const query = { _id: ObjectId(id) };
            const postReview = await foodCollection.updateOne(query, { $push: { 'reviews': req.body } });
            res.send(postReview);
        });

        // get user reivew on product
        app.get('/userReview/:uid', async (req, res) => {
            const uid = req.params.uid;
            const query = { 'reviews.uid': uid };
            res.send(await foodCollection.findOne(query));
        });

        // update name in the review
        app.put('/updateName', async (req, res) => {
            const uid = req.query.uid;
            const name = req.body.updatedName;
            const message = req.body.updatedMessage;
            const rating = req.body.updatedRating;
            const query = { 'reviews.uid': uid };
            res.send(await foodCollection.updateOne(query, { $set: { 'reviews.$': { name: name, description: message, rating: rating, uid: uid } } }));
            // res.status(200)
        });

        // delete product review
        app.delete('/deleteReview', async (req, res) => {
            const uid = req.query.uid;
            const query = { 'reviews.uid': uid };
            res.send(await foodCollection.updateOne(query, { '$pull': { 'reviews': { uid: uid } } }))
        });

        // approvde testimonial 
        app.put('/approvetestimonial', async (req, res) => {
            const query = { _id: ObjectId(req.query.id) };
            const updateDoc = {
                $set: { status: 'approve' }
            };
            res.send(await reviewCollection.updateOne(query, updateDoc))
        });

        // delete testimonial 
        app.delete('/deletetestimonial', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            res.send(await reviewCollection.deleteOne(query));
        });

        // add product 
        app.post('/addproduct', async (req, res) => {
            res.send(await foodCollection.insertOne(req.body));
        });

        // delete product 
        app.delete('/deleteproduct', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            res.send(await foodCollection.deleteOne(query));
        });

        // update product name
        app.put('/updateproductname', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: { name: req.body.name } };
            res.send(await foodCollection.updateOne(query, updateDoc));
        });

        // update product category
        app.put('/updateproductcategory', async (req, res) => {
            res.send(await foodCollection.updateOne({ _id: ObjectId(req.query.id) }, { $set: { category: req.body.category } }));
        });

        // update product price
        app.put('/updateproductprice', async (req, res) => {
            res.send(await foodCollection.updateOne({ _id: ObjectId(req.query.id) }, { $set: { price: req.body.price } }));
        });

        // saver user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // save user google sign
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // get all user
        app.get('/users', async (req, res) => {
            res.send(await usersCollection.find({}).toArray());
        });

        // get user
        app.get('/myprofile', async (req, res) => {
            const uid = req.query.uid;
            const query = { userId: uid };
            res.send(await usersCollection.findOne(query));
        });

        // set user phone number
        app.put('/setusernumber', async (req, res) => {
            const uid = req.query.uid;
            const query = { userId: uid };
            const updateDoc = { $set: { number: req.body.number } };
            res.send(await usersCollection.updateOne(query, updateDoc));
        });

        // set user address
        app.put('/setuseraddress', async (req, res) => {
            const uid = req.query.uid;
            const query = { userId: uid };
            const updateDoc = { $set: { address: req.body.address } };
            res.send(await usersCollection.updateOne(query, updateDoc));
        });

        // update user name
        app.put('/updateusername', async (req, res) => {
            const uid = req.query.uid;
            const query = { userId: uid };
            const updateDoc = { $set: { name: req.body.name } };
            res.send(await usersCollection.updateOne(query, updateDoc));
        });

        // update user image
        app.put('/updateuserimage', async (req, res) => {
            const uid = req.query.uid;
            const query = { userId: uid };
            console.log(req.body.logo);
            const updateDoc = { $set: { image: req.body.logo } };
            res.send(await usersCollection.updateOne(query, updateDoc));
        });

        // set admin role
        app.put('/makeadmin', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' }
            };
            res.send(await usersCollection.updateOne(filter, updateDoc));
        });

        // remove admin role 
        app.put('/removeadminrole', async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'user' }
            };
            res.send(await usersCollection.updateOne(filter, updateDoc));
        });

        // update order status 
        app.put('/updatestatus', async (req, res) => {
            const id = req.query.id;
            console.log(req.body, id);
            const filter = { _id: id };
            const updateDoc = {
                $set: { status: req.body.status }
            };
            res.send(await ordersCollection.updateOne(filter, updateDoc));
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