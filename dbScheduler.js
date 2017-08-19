/*
Go through every currency pair in the DB.
  If any is over 5 mins old, query and add to DB
Find poloniexdata
find all documents
  for each document (currency pair)
    if last elements 'date' is more than five minutes old
      add currencies to list

PoloniexData.deleteMany({}).then( (data) => {
  console.log(data);
});
 */


/*
 * Here we get all USDT currencies and add them to our database
 */

const mongoose = require('mongoose');
const schedule = require('node-schedule');
const poloniex = require('poloniex.js');
const PoloniexData = require('./models/PoloniexData');
const exchangeData = require('./controllers/exchangeData');

const polo = new poloniex();

// var USDT_baseCurrencies = []
// polo.getTicker( (err, data) => {
//   for (item in data) {
//     console.log(data[item]);
//     if (data[item].slice(0,4) == data[item].slice(0,4) /*'USDT'*/) {
//       USDT_baseCurrencies.push(data[item]);
//       console.log(USDT_baseCurrencies[item]);
//     }
//   }
//   for (pair in USDT_baseCurrencies) {
//     let A = USDT_baseCurrencies[pair].split('_')[0];
//     let B = USDT_baseCurrencies[pair].split('_')[1];
//     let q = {"currencyA": A, "currencyB": B};
//     console.log(pair);
//     // exchangeData.updatePoloniexDataAPI(USDT_baseCurrencies[pair], q);
//   }
// })

// PoloniexData.find({}).then( (doc) => {
//   for (var i = 0; i < doc.length; i++) {
//     for (var j = 0; j < )
//     console.log(doc[i]);
//   }
// });
//

var getPoloData = function() {
  var USDT_baseCurrencies = []
  return new Promise(function(resolve, reject) {
    polo.getTicker( (err, data) => {
      resolve(data)
      // for (item in data) {
      //   console.log(data[item]);
      //   if (data[item].slice(0,4) == data[item].slice(0,4) /*'USDT'*/) {
      //     USDT_baseCurrencies.push(data[item]);
      //     console.log(USDT_baseCurrencies[item]);
      //   }
      // }
    });
  });
}

exports.dbInitializer = async function() {
  // take an orderbook snapshot
  // for pairs in snapshot but not in database, add it (this will add new currencies)
  //
  
  var [orderbook, docs] = await Promise.all([getPoloData(), PoloniexData.find({})]);

  console.log("doc", docs);
  console.log("orderbook", orderbook);

  // items.forEach( (item) => {
  //   console.log(item);
  // })
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


exports.dbUpdater = function() {
  // Job runs at the top of every 5 minutes
  var j = schedule.scheduleJob('*/5 * * * *', function(){
    console.log(new Date(), 'DATABASE UPDATED');
    console.log();
  });

}
