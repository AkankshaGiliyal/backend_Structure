const { ethers } = require('ethers');
const { MongoClient } = require('mongodb');
const mntABI = require('./strategyABI.json');

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
  {
    name: 'telos',
    providerUrl: 'https://mainnet.telos.net/evm',
    collectionName: 'telos',
    dbUrl: 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/',
    dbName: 'vaults',
  },
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

async function fetchAddressesFromDB(client, dbName, chainName) {
  try {
    const db = client.db(dbName);
    const collection = db.collection('vault'); 

    const addresses = await collection.distinct('strategy', { chain: chainName });
    return addresses;
  } catch (error) {
    console.error('Error fetching addresses from MongoDB:', error);
    throw error;
  }
}

async function fetchTotalAssetsWithFunction(client, dbName, address, abi, providerUrl, chainName) {
  try {
    const db = client.db(dbName);
    const collection = db.collection('vault');
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(address, abi, provider);

    const existingDocument = await collection.findOne({ "strategy": address, "chain": chainName });
    const updateData = {};

    if (!existingDocument || !existingDocument.nonfungiblePositionManager) {
      const nonfungiblePositionManager = await contract.NonfungiblePositionManager();
      updateData.nonfungiblePositionManager = nonfungiblePositionManager.toString();
    }

    if (!existingDocument || !existingDocument.depositTokens) {
      const depositTokens = await contract.depositToken();
      updateData.depositTokens = depositTokens.toString();
    }
    if (!existingDocument || !existingDocument.feeDecimals) {
      const feeDecimals = await contract.feeDecimals();
      updateData.feeDecimals = feeDecimals.toString();
    }

    if (!existingDocument || !existingDocument.fundManagerFee) {
      const fundManagerFee = await contract.fundManagerFee();
      updateData.fundManagerFee= fundManagerFee.toString();
    }
    if (!existingDocument || !existingDocument.lpToken0) {
      const lpToken0 = await contract.lpToken0();
      updateData.lpToken0 = lpToken0.toString();
    }

    if (!existingDocument || !existingDocument.lpToken1) {
      const lpToken1 = await contract.lpToken1();
      updateData.lpToken1 = lpToken1.toString();
    }

    if (!existingDocument || !existingDocument.manager) {
      const manager = await contract.manager();
      updateData.manager = manager.toString();
    }

    if (!existingDocument || !existingDocument.partner) {
      const partner = await contract.partner();
      updateData.partner = partner.toString();
    }

    if (!existingDocument || !existingDocument.partnerFee) {
      const partnerFee = await contract.partnerFee();
      updateData.partnerFee = partnerFee.toString();
    }

    if (!existingDocument || !existingDocument.poolFee) {
      const poolFee = await contract.poolFee();
      updateData.poolFee = poolFee.toString();
    }

    if (!existingDocument || !existingDocument.protocolFee) {
      const protocolFee = await contract.protocolFee();
      updateData.protocolFee = protocolFee.toString();
    }

    if (!existingDocument || !existingDocument.stake) {
      const stake = await contract.stake();
      updateData.stake = stake.toString();
    }

    if (!existingDocument || !existingDocument.withdrawFee) {
      const withdrawFee = await contract.withdrawFee();
      updateData.withdrawFee = withdrawFee.toString();
    }

    if (!existingDocument || !existingDocument.withdrawFeeDecimals) {
      const withdrawFeeDecimals = await contract.withdrawFeeDecimals();
      updateData.withdrawFeeDecimals = withdrawFeeDecimals.toString();
    }


    

    if (Object.keys(updateData).length > 0) {
      const filter = { "strategy": address, "chain": chainName };
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
  const { providerUrl, dbUrl, dbName, name } = network;
  let client;

  try {
    client = await connectToDatabase(dbUrl);

    const addresses = await fetchAddressesFromDB(client, dbName, name);

    for (const address of addresses) {
      await fetchTotalAssetsWithFunction(client, dbName, address, mntABI, providerUrl, name);
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
