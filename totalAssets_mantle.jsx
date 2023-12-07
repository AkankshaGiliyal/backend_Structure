const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const mntABI = require('./ABI.jsx');
const provider = new ethers.providers.JsonRpcProvider("https://rpc.mantle.xyz");

const dbUrl = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
const dbName = 'vaults';

async function connectToDatabase() {
  const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function fetchTotalAssetsWithFunction(client, address) {
  try {
    const db = client.db(dbName);
    const collection = db.collection('mantle');

    const contract = new ethers.Contract(address, mntABI, provider);
    const totalAssets1 = await contract.totalAssets();
    const totalAssets=totalAssets1.toString();

    const filter = { "vaultAddress": address };
    const updateDocument = {
      $set: { totalAssets: totalAssets },
    };

    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
      console.log(`Total Supply for ${address} updated in MongoDB:`, totalAssets);
    } else {
      console.error(`Document for ${address} not found in MongoDB.`);
    }
  } catch (error) {
    console.error(`Error fetching and updating total supply for ${address}:`, error);
  }
}

async function fetchAddressesFromDB(client) {
  try {
    const db = client.db(dbName);
    const collection = db.collection('mantle');

    const addresses = await collection.distinct('vaultAddress');

    return addresses;
  } catch (error) {
    console.error('Error fetching addresses from MongoDB:', error);
    throw error;
  }
}

async function updateTotalAssets() {
  let client;
  try {
    client = await connectToDatabase();
    
    const addresses = await fetchAddressesFromDB(client);
    
    for (const address of addresses) {
      await fetchTotalAssetsWithFunction(client, address);
    }
  } catch (error) {
    console.error('Error updating total assets:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

updateTotalAssets();

const interval = setInterval(async () => {
  await updateTotalAssets();
}, 30 * 1000);




