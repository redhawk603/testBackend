import dotenv from "dotenv"
import cors from "cors"
import {MongoClient, ObjectId} from "mongodb"
import express from "express"
const app = express()
dotenv.config()


app.use(express.json())
app.use(cors())


const Mongo_URL = process.env.DATABASE_URL;
async function main() {
    const client = new MongoClient(Mongo_URL);
    await client.connect(); 
    console.log('Connected to database');
    app.get("/", (req, res) => {
        res.send("Welcome to the QuizCard API")
    })
    app.get('/subscribers', async (req, res) => {
        const subscribers = await client.db("quizcard0").collection("subscribers").findOne()
        console.log(subscribers)
        res.send(subscribers)
    })
    app.get('/userData', async (req, res) => {
        const userData = await client.db("quizcard0").collection("userData").find().toArray()
        console.log(userData)
        res.send(userData)
    })
    app.post('/userData', async (req, res) => {
        const userData = req.body;
        const existUser = await client.db("quizcard0").collection("userData").findOne({ email: userData.email });
        console.log(existUser, "existUser")
        if (existUser) {
            res.send({ message: "A user under that email already exists,", user: existUser })
        } else {
            const result = await client.db("quizcard0").collection("userData").insertOne(userData);
            console.log(`New user data added with the id - ${result.username}`);
            res.send(result, "User created.");
        }
        
    })
    app.put('/userData/:id', async (req, res) => {
        const userID = new ObjectId(req.params.id);
        const userData = req.body;
        console.log(userData, "userData")
        const result = await client.db("quizcard0").collection("userData").updateOne({ _id: userID }, { $set: userData });
        console.log(`User data modified with the id - ${req.params.id}`);
        res.send(result);
    })
    app.delete('/userData/:id', async (req, res) => {
        const userID = new ObjectId(req.params.id);
        const result = await client.db("quizcard0").collection("userData").deleteOne({ _id: userID });
        console.log(`User data deleted with the id - ${req.params.id}`);
        res.send(result);
    })
}
const client = await main()





app.listen(3000, () => console.log('Server running on port 3000'))
