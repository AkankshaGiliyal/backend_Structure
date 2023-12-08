const { MongoClient } = require('mongodb');

let fetch;

(async () => {
  const fetchModule = await import('node-fetch');
  fetch = fetchModule.default;

  const uri = 'mongodb+srv://liltest:BI6H3uJRxYOsEsYr@cluster0.qtfou20.mongodb.net/';
  const dbName = 'vaults';

  async function fetchAndInsertData(apiUrl) {
    try {
      const response = await fetch(apiUrl);
      if (response.status === 200) {
        const data = await response.json();

        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection('coingecko');

        for (const item of data.data) {
          const { id, attributes: { price_usd } } = item;
          const extractedId = id.split('_')[1];

          await collection.updateOne(
            { denominationAssetAddress: extractedId },
            { $set: { priceUSD: price_usd } },
            { upsert: true }
          );
          console.log(`Updated document with id: ${extractedId}`);
        }

        client.close();
      } else {
        console.error('Failed to fetch data from the API');
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchDataAndUpdate(apiUrl) {
    await fetchAndInsertData(apiUrl);
  }

  const apiUrl1 = 'https://api.geckoterminal.com/api/v2/networks/mantle/tokens/multi/0x201eba5cc46d216ce6dc03f6a759e8e766e956ae%2C0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9%2C0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111';
  const apiUrl2 = 'https://api.geckoterminal.com/api/v2/networks/manta-pacific/tokens/multi/0xf417f5a458ec102b90352f697d6e2ac3a3d2851f%2C0xb73603c5d87fa094b7314c74ace2e64d165016fb%2C0x0dc808adce2099a9f62aa87d9670745aba741746';

  
  setInterval(() => {
    fetchDataAndUpdate(apiUrl1);
    fetchDataAndUpdate(apiUrl2);
  }, 60000);

  
  fetchDataAndUpdate(apiUrl1);
  fetchDataAndUpdate(apiUrl2);
})();
































