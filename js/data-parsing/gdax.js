// Imported modules
var WebSocket = require('ws');
var request = require('request');

// Local variables
var highbids;
var lowasks;

// Function to parse the GDAX snapshot
function parseSnap(data){
    var count = 50; // Number of orders to take from snapshot
    for (var i = 0; i < count; i++){
      highbids.set(data.bids[i][2], {
        rate: data.bids[i][0],
        amount: data.bids[i][1]
      });
      lowasks.set(data.asks[i][2], {
        rate: data.asks[i][0],
        amount: data.asks[i][1]
      });
    }
}

// Parse data from Web Socket
// TODO: Explain (or link to) expected data scheme
function parse(data){
  var data = JSON.parse(data)

  // Determine relevant order map to use
  var bidsOrAsks = data.side === "buy" ? highbids : lowasks;

  switch (data.type) {
    case "open":
      bidsOrAsks.set(data.order_id, {
        rate:data.price,
        amount:data.remaining_size
      });
      break;
    case "done":
      bidsOrAsks.delete(data.order_id);
      break;
    case "change":
      bidsOrAsks(data.order_id).rate = data.price;
      bidsOrAsks(data.order_id).amount = data.new_size;
      break;
    case "heartbeat":
    case "received":
    case "match":
      // TODO: Why do these messages get sent? If we can't do anything with
      // them remove this TODO and comment the reason why.
      break;
    default:
      console.error("Unexpected data.type!", data.type);
  }
}

// Setting up WS Connection for GDAX
function openWebSocket() {
  var ws = new WebSocket('wss://ws-feed.gdax.com');

  // Setting up the subscribe message
  var subscribeBTC = {
    "type": "subscribe",
    "product_ids": [
      "BTC-USD",
      //"ETH-BTC",
    ]
  };

  // Subscribing to heartbeat messages
  var heartbeat = {
    "type": "heartbeat",
    "on": true
  };

  // Variables for snapshot parsing
  var pair = "BTC-USD"
  var url = "https://api.gdax.com/products/"+ pair + "/book?level=3";
  var options = {
    url: url,
    headers: {
      'User-Agent': 'request'
    }
  };

  // Calling a order book snapshot request and parsing it
  request(options, function(error, response, body) {
    parseSnap(JSON.parse(body));
  });

  // On websocket connection, send the subscribe and heartbeat JSON strings
  ws.on('open',function() {
    ws.send(JSON.stringify(subscribeBTC));
    ws.send(JSON.stringify(heartbeat));
  });

  // When a message is recieved, parse the data
  ws.on('message', parse);
}

// Export constructor that populates highbids and lowasks, returning another
// object with exposed public functions
module.exports = function(exchangeData) {
  highbids = exchangeData.highbids;
  lowasks = exchangeData.lowasks;
  return {
    openWebSocket: openWebSocket
  }
}