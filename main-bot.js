require('punycode/')

const fetchAllMarketCapAndCorrelationData = require('./utils/main-bot--GetMArketCap_Corr');
const RetreveTV_Data_MongoDBpush = require('./utils/main-bot--TVretrive'); // Adjust the path as needed
const updateGooglesheets = require('./utils/main-bot--GoogleSheets'); // Adjust the path as needed
const {getValidCredentials} = require('./utils/main-bot__testcredentials'); // Adjust the path as needed
const makeNonprovisionaDailySignal = require('./utils/main-bot--nonProvisional'); // Adjust the path as needed
const  {weightedaverage,MultipleWeightedAverage } = require('./utils/main-bot--CalculateWaightedSignals'); // Adjust the path as needed
const {alerts, MakeAlerts ,MakeAlertsFast} = require("./utils/main-bot--alerts");
const {fetchActiveOrders, DisplayBinanceData} = require("./utils/main-bot--bybit");
const { RestClientV5 }= require('bybit-api');





const cron = require('node-cron');
const { MongoClient } = require('mongodb');

// Replace this URI with your MongoDB connection string.
const uri = "mongodb+srv://_replace_:_replace_@cluster_replace_b.net/";
const client = new MongoClient(uri);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    } catch (error) {
        console.error(`Connection to MongoDB failed: ${error}`);
    }
}

// Connect to MongoDB when the application starts
connectToMongoDB();









async function main3(id,certificate) {


    const webhookUrl = 'https://discord.com/api/webhooks/12_replace_BNy1wTunxKJQ5ZfB831B-sGr_bcV';

    const dbname="yourDatabaseName_replace_"

    const type_mybe_provisional = "summary_data_for_" // dont replace
    // const type_mybe_provisional = "no_provisional_summary_" // dont replace

    const indicator_id = "USER;03d7ea932b9044e6aefc5d264f0e214f"  //_replace_
    const timeframes = ['4H','12H','1D', '2D', '3D', '4D', '5D', '6D', 'W', '1M'];

    const markets = ['BYBIT:BTCUSDT.P','BYBIT:ETHUSDT.P','BYBIT:SOLUSDT.P','BYBIT:BNBUSDT.P','BYBIT:LTCUSDT.P','BYBIT:MATICUSDT.P','BYBIT:INJUSDT.P','BYBIT:ENJUSDT.P'];
    // const markets = ['BYBIT:BTCUSDT.P','BYBIT:ETHUSDT.P'];

    const sheetTitle  = "YourSheetTitle_replace_asyouwant";  // gogle sheets  Replace with your sheet title
    const spreadsheetId = "1NJDfQ9ef5ubG5_replace_9SUe3VZBtp8";

            
    // await RetreveTV_Data_MongoDBpush(client,markets,timeframes,indicator_id,id,certificate,dbname); // check if fata exist and not call it
    // await makeNonprovisionaDailySignal(client,markets,timeframes,dbname);



    // await updateGooglesheets( client,markets, timeframes, type_mybe_provisional,sheetTitle,spreadsheetId);


    const apiKey = 'fd6113eb-8a_replace_3a95201';
        const url_coinbase = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest'; // dont replace
const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'BNB','INJ']; // Ensure this is an array
        const periods = [5,15, 30, 60, 90, 120,200];

    // const marketCapAndCorrelationData = await fetchAllMarketCapAndCorrelationData(client, dbname, apiKey, url_coinbase, cryptoSymbols, periods);
    //     console.log('Market Cap and Correlation Data:', marketCapAndCorrelationData);
    
    


    console.log("done");

    // Define multiple sets of weights
    const weightsSets = [
        [1, 1,1,1,1,1,1,1,1,1],
        [5, 0,1,1,0,1,5,1,1,1] // Example set 1
        // ... add more sets of weights as needed ...
    ];

    const weights = [1, 1,1,1,1,1,1,1,1,1]; // Example weights
    

    
    // MakeAlerts(markets, weights, client, type_mybe_provisional, timeframes,webhookUrl);
    MakeAlertsFast(markets, weightsSets, client, type_mybe_provisional, timeframes,webhookUrl);




    const key = "2Tgqe_replace_feqFqvcIF";  // bybit secret and normal key
    const secret = "fizNC3H_replace_NM3fUZLja6kB3"; // lowcaps
    const client_bybit = new RestClientV5({
        key: key,
        secret: secret,
      });
       


//   const allocations = {
//       'MATICUSDT': 0.5, // 50% allocation
//       'ENJUSDT': 0.5  // 50% allocation
//   };
  

    const leverage = '2.8';
    const NofCoins = 20;
    const lev = 1.2;
    

    DisplayBinanceData(client_bybit,webhookUrl,lev);

    TraderBotS(client, client_bybit, weights, indicator_id, id, certificate, dbname, markets, timeframes, webhookUrl,lev,NofCoins,leverage) 
        
}

async function abs(a){
    if (a>0) { return a}
    return -a
}


async function TraderBot(client, client_bybit, weights, indicator_id, id, certificate, dbname, markets, timeframes, webhookUrl, lev, NofCoins, leverage) {
    const type_mybe_provisional = "summary_data_for_";
    const type_mybe_provisional2 = "no_provisional_summary_";

    for (const market of markets) {
        try {
            await RetreveTV_Data_MongoDBpush(client, [market], timeframes, indicator_id, id, certificate, dbname);
            await makeNonprovisionaDailySignal(client, [market], timeframes, dbname);

            const weight = await weightedaverage(market, weights, client, type_mybe_provisional, timeframes, 0);
            console.log("weight",weight);
            console.log("NofCoins",NofCoins);
            let coin_bybit = market.split(':')[1].replace('.P', '');
            let allocationKey = coin_bybit.replace('.P', ''); // Remo


            let signal = 0;
            if (weight !== 0) {
                signal = weight / Math.abs(weight);
            }

            const allocations = { [allocationKey]: signal / NofCoins };

            console.log("allocations",allocations);

            
            await fetchActiveOrders(client_bybit, [market], allocations, webhookUrl, leverage, NofCoins, lev);
            console.log(`Active orders processed for market: ${market}`);

            // MakeAlerts([market], weights, client, type_mybe_provisional, timeframes, webhookUrl);
            // MakeAlerts([market], weights, client, type_mybe_provisional2, timeframes, webhookUrl);
        } catch (error) {
            console.error(`Error processing active orders for market: ${market}:`, error);
        }
    }
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function TraderBotS(client, client_bybit, weights, indicator_id, id, certificate, dbname, markets, timeframes, webhookUrl, lev, NofCoins, leverage) {
    const type_mybe_provisional = "summary_data_for_";
    const type_mybe_provisional2 = "no_provisional_summary_";

    const processMarket = async (market) => {
        try {
            console.log(`Starting operations for market: ${market}`);
            await RetreveTV_Data_MongoDBpush(client, [market], timeframes, indicator_id, id, certificate, dbname);
            await makeNonprovisionaDailySignal(client, [market], timeframes, dbname);

            const weight = await weightedaverage(market, weights, client, type_mybe_provisional, timeframes, 0);

            let signal = 0;
            if (weight !== 0) {
                signal = weight / Math.abs(weight);
            }

            let coin_bybit = market.split(':')[1].replace('.P', '');
            let allocationKey = coin_bybit.replace('.P', '');
            const allocations = { [allocationKey]: signal / NofCoins };

            await fetchActiveOrders(client_bybit, [market], allocations, webhookUrl, leverage, NofCoins, lev);

            // Uncomment these if alerts are needed
            // MakeAlerts([market], weights, client, type_mybe_provisional, timeframes, webhookUrl);
            // MakeAlerts([market], weights, client, type_mybe_provisional2, timeframes, webhookUrl);

            console.log(`Operations completed for market: ${market}`);
        } catch (error) {
            console.error(`Error in processing market: ${market}:`, error);
        }
    }

    for (const market of markets) {
        processMarket(market);
        // Wait for 10 seconds before starting the next market
        await delay(10000);
    }

    console.log('All markets initiated.');
}



async function M(){


    // const credentials = await getValidCredentials() // run these 3 comment section if you do not get google capcha

    // const id =  credentials.session
    // const certificate = credentials.signature



    const id = "ap6ms284yby_replace_cbbatbysp";  //tv id and certificate 
    const certificate = "v2:T9DQ1lPi_repla_replace_vrCmKi0E94nts=";
    
    //if (false){
    await main3(id,certificate)


    //}
}

M();