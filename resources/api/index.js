const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.DYNAMODB_TABLE;

module.exports.list = (event, context, callback) => {

  var params = {
    TableName: tableName,
    ProjectionExpression: "id, abstract, track, #v, #d, startTime, endTime",
    ExpressionAttributeNames: {'#v': 'views', '#d': 'date'}
  };

  console.log("Scanning table.");

  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
      callback(err);
    } else {
      return callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify({
          sessions: data.Items
        })
      });
    }
  };

  dynamoDb.scan(params, onScan);
};
