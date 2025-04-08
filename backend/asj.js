const express = require('express');
const cors = require('cors');  // Import CORS package
const app = express();

// Use CORS middleware to allow requests from the frontend (localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',  // Allow only requests from your frontend
  methods: ['GET', 'POST'],  // Allow GET and POST methods
}));

// The rest of your server code
require('dotenv').config();
const mongoClient = require('mongodb').MongoClient;

mongoClient.connect(process.env.DB_URL)
  .then(client => {
    const studyDBobj = client.db('studyappdb');
    const usersCollection = studyDBobj.collection('users');
    app.set('usersCollection', usersCollection);
    console.log("DB connection success");
  })
  .catch(err => {
    console.log("Error in DB connect", err);
  });

const userApp = require('./APIs/user-api');
const adminApp = require('./APIs/admin-api');

app.use('/user-api', userApp);
app.use('/admin-api', adminApp);

app.use((err, req, res, next) => {
  res.send({ status: "error", message: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('server on port 4000'));
