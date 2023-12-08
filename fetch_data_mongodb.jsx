const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 443;
app.use(cors());

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.rivera.money/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.rivera.money/fullchain.pem')
};


// mongoDB connection URI
const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';

app.get('/mantle', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();

    const db = client.db('vaults');
    const collection = db.collection('mantle');

    // fetching the data from MongoDB
    const data = await collection.find({}).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/manta', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true });
    await client.connect();

    const db = client.db('vaults');
    const collection = db.collection('manta-pacific');

    // fetching the data from the second collection
    const data = await collection.find({}).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from the second collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/oracle/coingecko', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db('vaults');
    const collection = database.collection('coingecko');

    const data = await collection.find().toArray();
    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB (data):', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tvl_usd_sum', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db('vaults');
    const collection1 = database.collection('mantle');
    const collection2 = database.collection('manta-pacific');

    const pipeline1 = [
      {
        $group: {
          _id: null,
          totalCollection1: { $sum: '$tvlUSD' },
        },
      },
      {
        $project: {
          _id: 0,
          totalCollection1: 1,
        },
      },
    ];

    const pipeline2 = [
      {
        $group: {
          _id: null,
          totalCollection2: { $sum: '$tvlUSD' }, 
        },
      },
      {
        $project: {
          _id: 0,
          totalCollection2: 1,
        },
      },
    ];

    const [result1, result2] = await Promise.all([
      collection1.aggregate(pipeline1).toArray(),
      collection2.aggregate(pipeline2).toArray(),
    ]);

    client.close();

    const sum1 = result1[0]?.totalCollection1 || 0;
    const sum2 = result2[0]?.totalCollection2 || 0;
    const combinedSum = sum1 + sum2;

    res.json({ sum: combinedSum });
  } catch (error) {
    console.error('Error calculating combined TVL sum:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/vaults', async (req, res) => {
  try {
    const chainName = req.query.chain;

    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const database = client.db('vaults');

    let collection1 = database.collection('mantle');
    let collection2 = database.collection('manta-pacific');

    const projection = { _id: 0 };

    let data1 = [];
    let data2 = [];

    if (chainName === 'mantle') {
      collection1 = database.collection('mantle');
      data1 = await collection1.find({}, projection).toArray();
    } else if (chainName === 'manta-pacific') {
      collection2 = database.collection('manta-pacific');
      data2 = await collection2.find({}, projection).toArray();
    } else {
      data1 = await collection1.find({}, projection).toArray();
      data2 = await collection2.find({}, projection).toArray();
    }

    client.close();

    res.json([...data1, ...data2]);
  } catch (error) {
    console.error('Error fetching TVL data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/vaults/dex', async (req, res) => {
  const dexValue = req.query.dex;

  if (!dexValue) {
    return res.status(400).json({ error: 'Dex value is missing in the request.' });
  }

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('vaults'); 

    const collection1 = db.collection('mantle');
    const collection2 = db.collection('manta-pacific');

    const projection = { _id: 0 };

    const data1 = await collection1.find({ dex: dexValue }, projection).toArray();
    const data2 = await collection2.find({ dex: dexValue }, projection).toArray();

    client.close();

    res.json([...data1, ...data2]);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/xriv/users/:walletAddress', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    const db = client.db('xRIV'); 
    const collection = db.collection('users'); 

    const walletAddress1 = req.params.walletAddress;

    // find the user document by wallet address
    const user = await collection.findOne({ walletAddress: walletAddress1 });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    client.close();

    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/vaults/stats', async (req, res) => {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('vaults');
    const collection = db.collection('stats');

    const data = await collection.find({}).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from stats collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/static/chain', async (req, res) => {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('static');
    const collection = db.collection('chain');

    const data = await collection.find({}).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from stats collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/static/dex', async (req, res) => {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db('static');
    const collection = db.collection('dex');

    const data = await collection.find({}).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from stats collection:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/quant', async (req, res) => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    const db = client.db('vaults');
    const collection1 = db.collection('mantle');
    const collection2 = db.collection('manta-pacific');

    const { value } = req.query; 

    let filter = {};
    if (value === 'true') {
      filter = { quant: true };
    } else if (value === 'false') {
      filter = { quant: false };
    }

    const data1 = await collection1.find(filter).toArray();
    const data2 = await collection2.find(filter).toArray();

    client.close();

    res.json([...data1, ...data2]);
  } catch (error) {
    console.error('Error handling /quant route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

https.createServer(options, app).listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
