# backend_Structure
## Components
List of major components/modules:
- Component 1: Smart Contract Data Retrieval and Database Update
- Component 2: API Data Retrieval and Database Update
- Component 3: Automation Scripts for Database Calculations
-Component 4: API endpoints
<br><br>
**Component 1: Smart Contract Data Retrieval and Database Update** <br>
  Description: This component interacts with smart contracts to retrieve data and updates the database accordingly. <br>
  **Continuous Data Retrieval and Update Script** <br>
  •	Purpose: <br>
   •	The script continuously interacts with Ethereum smart contracts and a MongoDB database to retrieve live data and update the database. <br>
  •	Process Explanation: <br>
   •	Library Dependencies: <br>
     •	ethers: Used for Ethereum interaction. <br>
     •	mongodb: Utilized for database operations. <br>
   •	Functionality: <br>
   •	Connection Setup: <br>
     •	Establishes connections to an Ethereum node (JsonRpcProvider) and MongoDB database (MongoClient). <br>
     •	Data Retrieval and Database Update: <br>
     •	fetchDataFromContract function fetches data from specified smart contract addresses and updates the MongoDB collection with retrieved information (e.g., 
        totalAssets, totalSupply). <br>
     •	fetchAddressesFromDB retrieves addresses of smart contracts (vaults) stored in the MongoDB collection. <br>
     •	updateData orchestrates the process by connecting to the database, fetching addresses, and updating data for each address. <br>
  •	Scheduled Execution: <br>
     •	Sets up an interval to execute the updateData function at regular intervals (e.g., every 30 seconds) for continuous data update in the database. <br>
•	Dependencies: <br>
   •	ethers: Library for Ethereum interaction. <br>
   •	mongodb: Library for MongoDB database operations. <br>
**One-time Database Update on New Vault Addition** <br>
•	Trigger: Executed when a new vault is added to the system. <br>

•	Purpose: Updates specific data attributes in the database upon the detection of a new vault addition. <br>

•	Process Explanation: <br>

  o	Library Dependencies: <br>
    	ethers: Utilized for Ethereum interaction. <br>
    	mongodb: Used for MongoDB database operations. <br>
  o	Functionality: <br>
    	Connection Setup: <br>
        •	Establishes connections to an Ethereum node (JsonRpcProvider) and MongoDB database (MongoClient). <br>
        •	Data Retrieval and Database Update: <br>
         •	fetchTotalAssetsWithFunction function retrieves specific attributes (e.g., name, symbol, owner, strategy) from the smart contract and updates the MongoDB 
            collection if any attribute is missing or incomplete in the existing database entry for the given vault address. <br>
         •	fetchAddressesFromDB retrieves addresses of smart contracts (vaults) stored in the MongoDB collection. <br>
         •	updateTotalAssets orchestrates the process by connecting to the database, fetching addresses, and updating specific attributes for each address. <br>
•	Scheduled Execution: <br>
  •	Sets up an interval to execute the updateTotalAssets function at regular intervals (e.g., every 10 minutes) for checking and updating data attributes related to new vault additions in the database. <br>

•	Dependencies: <br>

   o	ethers: Library for Ethereum interaction. <br>
   o	mongodb: Library for MongoDB database operations. <br>

- **Component 2: API Data Retrieval and Database Update** <br>
  
•	Description: This component retrieves data from an external API and updates the database with the obtained information. <br>
Process Explanation: <br>
 •	API Interaction: <br>
   •	The script interacts with an external API provided by Gecko Terminal to fetch token-related data. <br>
   •	It utilizes the node-fetch module for making HTTP requests to the API (apiUrl). <br>
 •	Data Processing and Database Update: <br>
  •	After retrieving data from the API, the script connects to a MongoDB database (uri, dbName) using MongoClient from the mongodb library. <br>
  •	It processes the obtained data, specifically targeting 'coingecko' collection updates in the database, particularly the 'priceUSD' field based on token IDs extracted 
  from the API response. <br>
•	Library Dependencies:
  •	mongodb: Utilized for MongoDB database operations. <br>
  •	node-fetch: Used for making HTTP requests to the external API. <br>

- **Component 3: Automation Scripts for Database Calculations** <br>
  Description: Executes automation scripts to perform calculations on database fields. <br>
Automation Script - TVL Calculation <br>
•	Description: This automation script calculates 'tvl_usd' based on fetched data from MongoDB collections. <br>
Process Explanation: <br>
•	Calculation Logic: <br>
 •	The script interacts with MongoDB collections to perform TVL (Total Value Locked) calculations. <br>
 •	It retrieves 'totalAssets' from the 'mantle' collection and 'priceUSD' from the 'coingecko' collection. <br>
 •	Utilizing this data, it calculates 'tvl_usd' by multiplying 'totalAssets' and 'priceUSD' and updates the 'tvlCollection' in the database. <br>
•	Library Dependencies: <br>
 •	mongodb: Utilized for MongoDB database operations. <br>
Automation Script - Stats Update <br>
•	Description: This automation script updates statistics related to vaults and TVL (Total Value Locked) in MongoDB collections. <br>
Process Explanation: <br>
•	Statistics Update: <br>
 •	The script accesses MongoDB collections ('stats', 'mantle', 'manta-pacific') to update statistics related to vaults and TVL. <br>
 •	It retrieves information from 'mantle' and 'manta-pacific' collections based on specified criteria ('chain', 'dex') and performs calculations to derive statistics. <br>
 •	Updates 'statsCollection' in the 'vaults' database with the calculated statistics. <br>
•	Library Dependencies: <br>
•	mongodb: Utilized for MongoDB database operations. <br>

- **Component 4: API Endpoints** <br>
  Description: Defines and manages API endpoints for interacting with the application. <br>
Library Dependencies: <br>
•	express: Used for setting up API routes and handling HTTP requests. <br>
•	mongodb: Utilized for interacting with MongoDB databases and collections. <br>
•	cors: Enables Cross-Origin Resource Sharing for the API. <br>
•	https and fs: Used for setting up secure HTTPS server options and file operations. <br>

