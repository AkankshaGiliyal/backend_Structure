const { MongoClient } = require('mongodb');

(async () => {
  const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
  const dbName = 'vaults';

  async function updateTVLData(collectionName) {
    try {
      const client = new MongoClient(uri, { useUnifiedTopology: true });
      await client.connect();
      const database = client.db(dbName);
      const tvlCollection = database.collection(collectionName);
      const priceCollection = database.collection('coingecko');

      // Fetch all TVL documents
      const tvlDocs = await tvlCollection.find({}).toArray();

      for (const tvlDoc of tvlDocs) {
        const id = tvlDoc.denominationAssetAddress;

        console.log(`Checking TVL document with asset: ${id}`);

        // Find the corresponding price document in 'price_usd' collection
        const priceDoc = await priceCollection.findOne({ denominationAssetAddress: { $regex: new RegExp(`^${id}$`, 'i') } });

        if (priceDoc) {
          // Calculate tvl_usd by multiplying price_usd and totalAssets
          const price_usd = parseFloat(priceDoc.priceUSD);
          const totalAssets = parseFloat(tvlDoc.totalAssets);
          const decimal = tvlDoc.denominationDecimal || 0; 
          const tvlUSD = (price_usd * totalAssets) / Math.pow(10, decimal);

          // Update the TVL document with tvl_usd
          await tvlCollection.updateOne({ _id: tvlDoc._id }, { $set: { tvlUSD } });
          console.log(`Updated TVL document with _id: ${tvlDoc._id} with tvl_usd: ${tvlUSD}`);
        } else {
          console.error(`Price document not found for asset: ${id}`);
        }
      }

      client.close();
    } catch (error) {
      console.error(error);
    }
  }

 

  // Schedule periodic updates for both collections
  setInterval(() => {
    updateTVLData('mantle');
    updateTVLData('manta-pacific');
  }, 60000);
})();
