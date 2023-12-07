const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
const dbName = 'vaults';

async function updateStats() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    const database = client.db(dbName);
    const statsCollection = database.collection('stats');
    const tvlCollection = database.collection('mantle');
    const tvlMantaCollection = database.collection('manta-pacific');

    const statsDocuments = await statsCollection.find({}).toArray();

    for (const doc of statsDocuments) {
      const chainNameStats = doc.chain; 
      const dex = doc.dex;

      const tvlCount = await tvlCollection.countDocuments({ 'chain': chainNameStats, dex });
      const tvlMantaCount = await tvlMantaCollection.countDocuments({ 'chain': chainNameStats, dex });

      const tvlDocuments = await tvlCollection.find({ 'chain': chainNameStats, dex }).toArray();
      const tvlMantaDocuments = await tvlMantaCollection.find({ 'chain': chainNameStats, dex }).toArray();

      const tvlSum = tvlDocuments.reduce((sum, tvlDoc) => sum + (tvlDoc.tvlUSD || 0), 0);
      const tvlMantaSum = tvlMantaDocuments.reduce((sum, tvlMantaDoc) => sum + (tvlMantaDoc.tvlUSD || 0), 0);

      const totalSum = tvlSum + tvlMantaSum;

      
      await statsCollection.updateOne(
        { chain: chainNameStats, dex },
        {
          $set: {
            totalVaults: tvlCount + tvlMantaCount, 
            tvlUSD: totalSum 
          }
        }
      );
    }

    console.log('Stats collection updated successfully.');
  } catch (error) {
    console.error('Error updating stats collection:', error);
  } finally {
    client.close();
  }
}

updateStats();

setInterval(() => {
  console.log('Running the updateStats function...');
  updateStats();
}, 30 * 60 * 1000);