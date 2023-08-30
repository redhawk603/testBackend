import dotenv from "dotenv"
import cors from "cors"
import {CURSOR_FLAGS, MongoClient, ObjectId} from "mongodb"
import express from "express"
import OpenAI from 'openai';
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
        const existID = await client.db("quizcard0").collection("userData").findOne({ email: userData.email });
        if (existID) {
            console.log("User data already exists.")
            res.send({msg:"User data already exists."})
        }
        else {
        const result = await client.db("quizcard0").collection("userData").insertOne(userData);
        console.log(`New user data added with the id - ${result.insertedId}`);
        res.send({msg:"User created!",result});
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

    app.post('/api/update/:id', async (req, res) => {
        const userID = new ObjectId(req.params.userId);
        console.log(userID, "userID")
        const updateData = req.body;
        const result = await client.db("quizcard0").collection("userData").updateOne({ _id: userID }, { $set: updateData });
        console.log(`User data modified with the id - ${result}`);
        return res.send(result);
    })

    app.post('/views/update', async (req, res) => {


        // return res.send(req.body)

        // const id = new ObjectId(req.params.id)
        const id = new ObjectId('64dde98dc325c9db62e67b68')

        
    
    
        const filter = { _id: id }
        


        const update = {
            $inc: {
                ...req.body,

            }
        }

        // return res.send(update);
        
        const findID = await client.db("quizcard0").collection("views").find({_id : id}).toArray();
        if (findID.length > 0) {
            console.log("User data already exists.")
            const result = await client.db("quizcard0").collection("views").updateMany(filter, update);
            res.send({msg:"User data already exists."})

        }
        else {
        const result = await client.db("quizcard0").collection("views").insertOne(
            {
                _id : id,
                GryffindorViews : 0,
                RavenclawViews : 0,
                HufflepuffViews : 0,
                SlytherinViews : 0,
                ...req.body,

            }

            );
            res.send(result)
        }
        console.log(findID)
        
        
        
        // res.send(result)
        // res.send('update')
    
    
    })

    app.get('/hello/hello', (req, res) => {
        res.send("hi")
    })

    app.get('/views', async (req, res) => {
        const views = await client.db("quizcard0").collection("views").find().toArray()

        if(views.length === 0) throw new Error('No views found');

        return  res.send(views[0])
    
    })

    app.post('/api/ai', async (req, res) => {
        const apikey = "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"
        const query = req.body.query;

        const openai = new OpenAI({
            apiKey: apikey
        });

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: `write a description for a ${query} and do not write any other text before or after`}],
            model: 'gpt-3.5-turbo',
          });

          res.send(completion.choices[0])
        
        
        console.log(completion.choices);

    })
}



main()
app.listen(3000, () => console.log('Server running on port 3000')) 
