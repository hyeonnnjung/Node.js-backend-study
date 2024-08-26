const {MongoClient} = require("mongodb");
const uri = "mongodb+srv://cathy2750:QMRBn85XxMhuRs8e@cluster0.psrg7y1.mongodb.net/board";

//원래는 MongoClient.connect(uri, callback)을 실행해야 하지만 uri값을 몰라도 mongodb-connection(callback)으로 실행할 수 있다는 뜻
module.exports = function(callback){
    return MongoClient.connect(uri,callback);
};