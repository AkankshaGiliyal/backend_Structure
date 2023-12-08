const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const mntABI = require('./ABI.jsx');

const networks = [
  {
    name: 'mantle',
    providerUrl: 'https://rpc.mantle.xyz',
    collectionName: 'mantle',
    dbUrl: 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/',
    dbName: 'vaults',
  },
  {
    name: 'manta-pacific',
    providerUrl: 'https://pacific-rpc.manta.network/http',
    collectionName: 'manta-pacific',
    dbUrl: 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/',
    dbName: 'vaults',
  },
  // Add more networks as needed
];

async function connectToDatabase(dbUrl) {
  const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

async function fetchAddressesFromDB(client, dbName, collectionName) {
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

async function fetchTotalAssetsWithFunction(client, dbName, collectionName, address, abi, providerUrl) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(address, abi, provider);

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
      const updateDocument = { $set: updateData };

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

async function updateTotalAssetsForNetwork(network) {
  const { providerUrl, collectionName, dbUrl, dbName } = network;
  let client;

  try {
    client = await connectToDatabase(dbUrl);

    const addresses = await fetchAddressesFromDB(client, dbName, collectionName);

    for (const address of addresses) {
      await fetchTotalAssetsWithFunction(client, dbName, collectionName, address, mntABI, providerUrl);
    }
  } catch (error) {
    console.error(`Error updating total assets for ${network.name}:`, error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Loop through each network and update assets
for (const network of networks) {
  updateTotalAssetsForNetwork(network);
}

// Set interval to update assets periodically for each network
const interval = setInterval(async () => {
  for (const network of networks) {
    updateTotalAssetsForNetwork(network);
  }
}, 10 * 60 * 1000);

