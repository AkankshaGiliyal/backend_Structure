
const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const mntABI = require('./ABI.jsx');
const provider = new ethers.providers.JsonRpcProvider("https://pacific-rpc.manta.network/http");

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
    const collection = db.collection('manta-pacific');

    const contract = new ethers.Contract(address, mntABI, provider);

    const existingDocument = await collection.findOne({ "vaultAddress": address });

    const updateData = {};

    if (!existingDocument || !existingDocument.name) {
      const name = await contract.name();
      updateData.name = name.toString();
    }

    if (!existingDocument || !existingDocument.symbol) {
      const symbol = await contract.symbol();
      updateData.symbol = symbol.toString();
    }

    if (!existingDocument || !existingDocument.owner) {
      const owner = await contract.owner();
      updateData.owner = owner.toString();
    }

    if (!existingDocument || !existingDocument.strategy) {
      const strategy = await contract.strategy();
      updateData.strategy = strategy.toString();
    }

    if (Object.keys(updateData).length > 0) {
      const filter = { "vaultAddress": address };
      const updateDocument = {
        $set: updateData,
      };

      const result = await collection.updateOne(filter, updateDocument);

      if (result.modifiedCount === 1) {
        console.log(`Data for ${address} updated in MongoDB:`, updateData);
      } else {
        console.error(`Document for ${address} not found in MongoDB.`);
      }
    } else {
      console.log(`Data for ${address} is already up-to-date.`);
    }
  } catch (error) {
    console.error(`Error fetching and updating data for ${address}:`, error);
  }
}

async function fetchAddressesFromDB(client) {
  try {
    const db = client.db(dbName);
    const collection = db.collection('manta-pacific');

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
}, 10 * 60 * 1000);







