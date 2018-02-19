var webPush = require('web-push');

function updateResult(resultJSON, impressionId, message) {
	// var cookie = notification.cookie;
 //    var advId = notification.advId;
 //    var analyzeAdvId = notification.AnalyzeAdvId;
 //    var bannerId = notification.bannerid;
    var imprId = notification.payload.notificationid;
    resultJSON.imprId = message;
    // resultJSON.push({
    //     "cookie":cookie,
    //     "message":message,
    //     "advId":advId,
    //     "analyzeAdvId":analyzeAdvId,
    //     "bannerId":bannerId,
    //     "imprId":imprId
    // });
    // console.log("result length " + resultJSON.length);
    // if(resultJSON.length >= notificationCount) {
    //     callback(null,resultJSON);
    // }
}

exports.handler = (event, context, callback) => {

    // console.log('Received event:', JSON.stringify(event, null, 2));
    // console.log('Received body: ', JSON.stringify(event.body));
    console.log("started");
    // const done = (err, res) => callback(null, {
    //     statusCode: err ? '502' : '200',
    //     body: err ? JSON.stringify(res) : JSON.stringify(res),
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    // });

    var notificationArray = JSON.parse(event.body);

   var resultJSON = JSON.parse("{}");
   var promises = [];
    for(var i = 0 ; i < notificationArray.length ; i++) {
        var notification = notificationArray[i];
        var endpoint = notification.endpoint;
        var gcmkey = notification.gcmkey;
        var auth = notification.auth;
        var key = notification.key;
        // if(i != 0) {
        // 	notification.cookie = 'viz_my_'+i;
        // 	endpoint += Math.floor((Math.random() * 1000) + 1);
        // 	auth += Math.floor((Math.random() * 1000) + 1);
        // 	key += Math.floor((Math.random() * 1000) + 1);
        //     payload.notificationid = "impr_" + i;
        // }
        var payload = notification.payload;
        var msg_expiry_ttl = notification.payload.time_to_live ? notification.payload.time_to_live : 2419200;

        let imprId = payload.notificationid;

        var promise = webPush.sendNotification(endpoint, {
            payload: JSON.stringify(payload),
            userPublicKey: key,
            userAuth: auth,
            gcmAPIKey: gcmkey,
            TTL: msg_expiry_ttl
        }).then(function(event) {
            console.log("Success: " + notification.cookie);
            resultJSON[imprId] = "SUCCESS";
        }).catch(function(e) {
            // console.log("Error: " + notification.cookie + " Message: " + JSON.stringify(e));
            resultJSON[imprId] = JSON.stringify(e.body);
        });
        promises.push(promise);
    }
    Promise.all(promises).then(function(values) {
    	// console.log("Finished with all calls " + JSON.stringify(promises));
    	callback(null, {
        	statusCode: '200',
        	body: JSON.stringify(resultJSON),
        	headers: {
            	'Content-Type': 'application/json',
        	},
    	});
    });
};
