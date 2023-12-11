# backend_Structure
## Components
List of major components/modules:
- Component 1: Smart Contract Data Retrieval and Database Update
- Component 2: API Data Retrieval and Database Update
- Component 3: Automation Scripts for Database Calculations
-Component 4: API endpoints
**Component 1: Smart Contract Data Retrieval and Database Update**
  Description: This component interacts with smart contracts to retrieve data and updates the database accordingly.
  Continuous Data Retrieval and Update Script
•	Purpose:
•	The script continuously interacts with Ethereum smart contracts and a MongoDB database to retrieve live data and update the database.
•	Process Explanation:
•	Library Dependencies:
•	ethers: Used for Ethereum interaction.
•	mongodb: Utilized for database operations.
•	Functionality:
•	Connection Setup:
•	Establishes connections to an Ethereum node (JsonRpcProvider) and MongoDB database (MongoClient).
•	Data Retrieval and Database Update:
•	fetchDataFromContract function fetches data from specified smart contract addresses and updates the MongoDB collection with retrieved information (e.g., totalAssets, totalSupply).
•	fetchAddressesFromDB retrieves addresses of smart contracts (vaults) stored in the MongoDB collection.
•	updateData orchestrates the process by connecting to the database, fetching addresses, and updating data for each address.
•	Scheduled Execution:
•	Sets up an interval to execute the updateData function at regular intervals (e.g., every 30 seconds) for continuous data update in the database.
•	Dependencies:
•	ethers: Library for Ethereum interaction.
•	mongodb: Library for MongoDB database operations.
             One-time Database Update on New Vault Addition
•	Trigger: Executed when a new vault is added to the system.

•	Purpose: Updates specific data attributes in the database upon the detection of a new vault addition.

•	Process Explanation:

o	Library Dependencies:
	ethers: Utilized for Ethereum interaction.
	mongodb: Used for MongoDB database operations.
o	Functionality:
	Connection Setup:
•	Establishes connections to an Ethereum node (JsonRpcProvider) and MongoDB database (MongoClient).
•	Data Retrieval and Database Update:
•	fetchTotalAssetsWithFunction function retrieves specific attributes (e.g., name, symbol, owner, strategy) from the smart contract and updates the MongoDB collection if any attribute is missing or incomplete in the existing database entry for the given vault address.
•	fetchAddressesFromDB retrieves addresses of smart contracts (vaults) stored in the MongoDB collection.
•	updateTotalAssets orchestrates the process by connecting to the database, fetching addresses, and updating specific attributes for each address.
•	Scheduled Execution:
•	Sets up an interval to execute the updateTotalAssets function at regular intervals (e.g., every 10 minutes) for checking and updating data attributes related to new vault additions in the database.

•	Dependencies:

o	ethers: Library for Ethereum interaction.
o	mongodb: Library for MongoDB database operations.

- **Component 2: API Data Retrieval and Database Update**
  Component 2: API Data Retrieval and Database Update
•	Description: This component retrieves data from an external API and updates the database with the obtained information.
Process Explanation:
•	API Interaction:
•	The script interacts with an external API provided by Gecko Terminal to fetch token-related data.
•	It utilizes the node-fetch module for making HTTP requests to the API (apiUrl).
•	Data Processing and Database Update:
•	After retrieving data from the API, the script connects to a MongoDB database (uri, dbName) using MongoClient from the mongodb library.
•	It processes the obtained data, specifically targeting 'coingecko' collection updates in the database, particularly the 'priceUSD' field based on token IDs extracted from the API response.
•	Library Dependencies:
•	mongodb: Utilized for MongoDB database operations.
•	node-fetch: Used for making HTTP requests to the external API.
Dependencies:
•	mongodb: Library for MongoDB database operations.
•	node-fetch: Module for making HTTP requests to the external API

- **Component 3: Automation Scripts for Database Calculations**
  Description: Executes automation scripts to perform calculations on database fields.
Automation Script - TVL Calculation
•	Description: This automation script calculates 'tvl_usd' based on fetched data from MongoDB collections.
Process Explanation:
•	Calculation Logic:
•	The script interacts with MongoDB collections to perform TVL (Total Value Locked) calculations.
•	It retrieves 'totalAssets' from the 'mantle' collection and 'priceUSD' from the 'coingecko' collection.
•	Utilizing this data, it calculates 'tvl_usd' by multiplying 'totalAssets' and 'priceUSD' and updates the 'tvlCollection' in the database.
•	Library Dependencies:
•	mongodb: Utilized for MongoDB database operations.
Dependencies:
•	mongodb: Library for MongoDB database operations
Automation Script - Stats Update
•	Description: This automation script updates statistics related to vaults and TVL (Total Value Locked) in MongoDB collections.
Process Explanation:
•	Statistics Update:
•	The script accesses MongoDB collections ('stats', 'mantle', 'manta-pacific') to update statistics related to vaults and TVL.
•	It retrieves information from 'mantle' and 'manta-pacific' collections based on specified criteria ('chain', 'dex') and performs calculations to derive statistics.
•	Updates 'statsCollection' in the 'vaults' database with the calculated statistics.
•	Library Dependencies:
•	mongodb: Utilized for MongoDB database operations.
Dependencies:
•	mongodb: Library for MongoDB database operations.

- **Component 4: API Endpoints**
  Description: Defines and manages API endpoints for interacting with the application.
  Endpoint List and Descriptions:
1.	/mantle: Retrieves data from the 'mantle' collection in the 'vaults' database.
2.	/manta: Fetches data from the 'manta-pacific' collection in the 'vaults' database.
3.	/oracle/coingecko: Gathers data from the 'coingecko' collection in the 'vaults' database.
4.	/tvl_usd_sum: Calculates and provides the sum of 'tvl_usd' from 'mantle' and 'manta-pacific' collections.
5.	/vaults: Fetches vault data based on specified criteria ('chain').
6.	/vaults/dex: Retrieves vault data based on specified 'dex' value.
7.	/xriv/users/:walletAddress: Fetches user data from the 'xRIV' database based on a provided wallet address.
8.	/vaults/stats: Retrieves stats data from the 'stats' collection in the 'vaults' database.
9.	/static/chain: Fetches data related to 'chain' from the 'static' database.
10.	/static/dex: Retrieves data related to 'dex' from the 'static' database.
11.	/quant: Handles query parameter 'value' to retrieve data from 'mantle' and 'manta-pacific' collections based on 'quant' field value.
Functionality:
•	The API endpoints serve different types of data from various MongoDB collections, facilitating specific data retrieval based on endpoint paths and query parameters.
Library Dependencies:
•	express: Used for setting up API routes and handling HTTP requests.
•	mongodb: Utilized for interacting with MongoDB databases and collections.
•	cors: Enables Cross-Origin Resource Sharing for the API.
•	https and fs: Used for setting up secure HTTPS server options and file operations

