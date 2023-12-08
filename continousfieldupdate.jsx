const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const mntABI = require('./ABI.jsx');

const provider1 = new ethers.providers.JsonRpcProvider("https://pacific-rpc.manta.network/http");
const provider2 = new ethers.providers.JsonRpcProvider("https://rpc.mantle.xyz");

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

async function fetchDataFromContract(client, address, provider, collectionName) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const contract = new ethers.Contract(address, mntABI, provider);

    const totalAssets1 = await contract.totalAssets();
    const totalSupply = await contract.totalSupply();
    const totalTvlCap = await contract.totalTvlCap();

    const totalAssets = totalAssets1.toString();
    const supply = totalSupply.toString();
    const tvlcap = totalTvlCap.toString();

    const filter = { "vaultAddress": address };
    const updateDocument = {
      $set: { totalAssets: totalAssets, totalSupply: supply, totalTvlCap: tvlcap },
    };

    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
      console.log(`Data for ${address} updated in MongoDB:`, { totalAssets, supply, tvlcap });
    } else {
      console.error(`Document for ${address} not found in MongoDB.`);
    }
  } catch (error) {
    console.error(`Error fetching and updating data for ${address}:`, error);
  }
}

async function fetchAddressesFromDB(client, collectionName) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const addresses = await collection.distinct('vaultAddress');

    return addresses;
  } catch (error) {
    console.error('Error fetching addresses from MongoDB:', error);
    throw error;
  }
}

async function updateData(provider, collectionName) {
  let client;
  try {
    client = await connectToDatabase();
    
    const addresses = await fetchAddressesFromDB(client, collectionName);
    
    for (const address of addresses) {
      await fetchDataFromContract(client, address, provider, collectionName);
    }
  } catch (error) {
    console.error('Error updating data:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}


updateData(provider1, 'manta-pacific');


updateData(provider2, 'mantle');

const interval1 = setInterval(async () => {
  await updateData(provider1, 'manta-pacific');
}, 30 * 1000);

const interval2 = setInterval(async () => {
  await updateData(provider2, 'mantle');
}, 30 * 1000);





