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
    const collection = database.collection('vault'); 

    const pipeline = [
      {
        $group: {
          _id: null,
          totalTvlUSD: { $sum: '$tvlUSD' },
        },
      },
      {
        $project: {
          _id: 0,
          totalTvlUSD: 1,
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    client.close();

    const totalSum = result[0]?.totalTvlUSD || 0;

    res.json({ sum: totalSum });
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
    const collection = database.collection('vault'); // Use the 'test' collection

    const projection = { _id: 0 };
    let data = [];

    if (chainName) {
     
      const filter = { chain: chainName }; 

      data = await collection.find(filter, projection).toArray();
    } else {
      
      data = await collection.find({}, projection).toArray();
    }

    client.close();

    res.json(data);
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
    const collection = db.collection('vault'); // Use the 'test' collection

    const projection = { _id: 0 };

    const data = await collection.find({ dex: dexValue }, projection).toArray();

    client.close();

    res.json(data);
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
    const collection = db.collection('vault'); 

    const { value } = req.query;

    let filter = {};
    if (value === 'true' || value === 'false') {
      filter = { quant: value }; // Filter based on string representations of boolean values
    }

    const data = await collection.find(filter).toArray();

    client.close();

    res.json(data);
  } catch (error) {
    console.error('Error handling /quant route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

https.createServer(options, app).listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
