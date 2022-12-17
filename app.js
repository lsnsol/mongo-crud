// imports
const express = require('express');
const mongoDb = require('mongoose');
const bodyParser = require('body-parser');

// express server settings
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// check if command line arguments given else use these constants
const port = process.argv[2] ? process.argv[2] : 5000;
const dbName = process.argv[3] ? process.argv[3] : 'testDB';
const mongoSchemaName = process.argv[4] ? process.argv[4] : 'movies';
const mongoConUrl = process.argv[5] ? 'mongodb://' + process.argv[5] + '/' + dbName : 'mongodb://localhost:27017/' + dbName;

// mongo constants
const mongoConOptns = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
const mongoSchema = new mongoDb.Schema({
    uid: Number,
    name: String,
    imgPath: String,
    summary: String
});

// create the model of the mongo to use
const mongoModel = mongoDb.model(mongoSchemaName, mongoSchema);

//Port
app.listen(port, (err) => {
    if (err) {
        console.error('ExpressJS Error:', err);
        process.exit();
    }
    else
        console.log('Running on Port:', port);
});

// connect to db
mongoDb.connect(mongoConUrl, mongoConOptns, (err) => {
    if (err) {
        console.error('Mongo Connection Error:', err);
        process.exit();
    }
    else
        console.log('Connected to Database:', dbName);
});

// check if connection established or not
mongoDb.connection.once('open', _ => {
    console.log('Database Connected Successfully To:', mongoConUrl);
});

// if any errors occurs
mongoDb.connection.on('error', err => {
    console.error('Database Connection Failed:', err);
});

// API calls to be processed here 
// get
app.get('/get/:id', (req, res) => {
    uid = req.params.id;
    mongoModel.find(({ uid }), (err, val) => {
        if (err) {
            console.error('Error in Finding Data');
            res.status(500).send('Server Error');
        }
        else
            if (val.length === 0) {
                console.log('No Data with this id');
                res.status(404).send('No Data');
            }
            else {
                console.log('Data Sent Successfully');
                res.status(200).send(val[0]);
            }
    });
});

// post
app.post('/post', (req, res) => {
    const uid = req.body.uid;
    const data = new mongoModel({
        uid: req.body.uid,
        name: req.body.name,
        imgPath: req.body.imgPath,
        summary: req.body.summary
    });
    if (uid)
        mongoModel.find(({ uid }), (err, val) => {
            console.log(val)
            if (err) {
                console.error('Error in Saving Data:', err);
                res.status(500).send('Server Error');
            }
            else if (val && val.length === 0)
                data.save((err, doc) => {
                    if (err) {
                        console.error('Error in Saving Data:', err);
                        res.status(500).send('Server Error');
                    }
                    else {
                        console.log('Data Added Successfully');
                        res.status(200).json('Data Added Successfully');
                    }
                });
            else {
                console.log('Duplicate Data');
                res.status(400).json('Duplicate Data');
            }
        });
    else {
        console.error('Error in Saving Data:', req.body);
        res.status(400).send('No Data Recieved');
    }
});

// update
app.put('/put/:id', (req, res) => {
    const uid = req.params.id;
    const name = req.body.name;
    const imgPath = req.body.imgPath;
    const summary = req.body.summary;

    mongoModel.findOneAndUpdate({ uid }, { $set: { name, imgPath, summary } }, (err, data) => {
        if (err) {
            console.error('Error in Updating Data:', err);
            res.status(500).send('Server Error');
        } else {
            if (data == null) {
                console.log('No Data');
                res.status(404).send('No Data');
            }
            else {
                console.log('Data Updated Successfully');
                res.status(200).send('Data Updated Successfully');
            }
        }
    });
});

// delete
app.delete('/delete/:id', (req, res) => {
    const uid = req.params.id;
    mongoModel.findOneAndDelete(({ uid }), (err, docs) => {
        if (err) {
            console.error('Error in Deleting Data');
            res.status(500).send('Error');
        }
        else {
            if (docs == null) {
                console.log('No Data');
                res.status(404).send('No Data');
            }
            else {
                console.log('Data Deleted Successfully');
                res.status(200).send('Data Deleted Successfully');
            }
        }
    });
});
