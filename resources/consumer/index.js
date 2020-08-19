const AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const request = require('request');

const tableName = process.env.DYNAMODB_TABLE;
const historyTableName = process.env.DYNAMODB_HISTORY_TABLE;
const kubeconCookie = process.env.KUBECON_COOKIE;

exports.handler = function(event, context) {
  let kubeConTracks = [
    {name: '101 Track', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55064&RandomValue=1597773745984'},
    {name:'Application + Development', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55069&RandomValue=1597777372075'},
    {name:'Case Studies', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55070&RandomValue=1597777321881'},
    {name:'CI/CD', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55071&RandomValue=1597777431192'},
    {name:'Community', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55072&RandomValue=1597777402258'},
    {name:'Customizing + Extended Kubernetes', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55073&RandomValue=1597777449364'},
    {name:'Experiences', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55094&RandomValue=1597786992913'},
    {name:'Keynotes', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=52858&RandomValue=1597787015165'},
    {name:'Lightning Talks', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55066&RandomValue=1597787068202'},
    {name:'Machine Learning + Data', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55266&RandomValue=1597787090819'},
    {name:'Maintainer Track', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55067&RandomValue=1597787106494'},
    {name:'Networking', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55074&RandomValue=1597787121876'},
    {name:'Observability', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55075&RandomValue=1597787137856'},
    {name:'Operations', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55076&RandomValue=1597787146732'},
    {name:'Performance', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55077&RandomValue=1597787160357'},
    {name:'Runtimes', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55078&RandomValue=1597787174901'},
    {name:'Security + Identity + Policy', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55080&RandomValue=1597787188381'},
    {name:'Serverless', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55081&RandomValue=1597787204893'},
    {name:'Service Mesh', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55273&RandomValue=1597787216816'},
    {name:'Storage', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55082&RandomValue=1597787228924'},
    {name:'Tutorials', url: 'https://onlinexperiences.com/scripts/Server.nxp?LASCmd=AI:1;F:LBSEXPORT!JSON&SQLID=14523&EventPackageKey=55068&RandomValue=1597787240218'} 
  ]

  let options = {
    json: true,
    headers: {
      'Cookie': kubeconCookie;
    }
  };

  for(let track of kubeConTracks) {
    console.log("Processing: " + track.name);

    request(track.url, options, (error, res, body) => {
      if (error) {
          return  console.log(error)
      };

      if (!error && res.statusCode == 200) {
        let sessionsArray = body.ResultSet[0];

        for (let session of sessionsArray) {
          var params = {
            Item: {
              "id": { S: session.Description },
              "track": {S: track.name}
            },
            TableName: tableName
          };

          if ( typeof session.Abstract !== 'undefined') {
            params.Item.abstract = {S: session.Abstract };
          }

          if ( typeof session.IsOnDemand !== 'undefined') {
            params.Item.onDemand = {N: session.IsOnDemand.toString() };
          }

          if ( typeof session.EventSpeakerName !== 'undefined') {
            params.Item.speaker = {S: session.EventSpeakerName };
          }

          if ( typeof session.Rating !== 'undefined') {
            params.Item.rating = {N: session.Rating.toString() };
          }

          if ( typeof session.NumViews !== 'undefined') {
            params.Item.views = {N: session.NumViews.toString() };
          }

          if ( typeof session.NumLikes !== 'undefined') {
            params.Item.likes = {N: session.NumLikes.toString() };
          }

          if ( typeof session.FromDate !== 'undefined') {
            params.Item.date = {S: session.FromDate };
          }

          if ( typeof session.FromTime !== 'undefined') {
            params.Item.startTime = {S: session.FromTime };
          }

          if ( typeof session.ToTime !== 'undefined') {
            params.Item.endTime = {S: session.ToTime };
          }

          dynamodb.putItem(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
          });

          // History table
          params.TableName = historyTableName;

          let timestamp = new Date();
          params.Item.timestamp = {S: timestamp.toString() };

          dynamodb.putItem(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
          });
        }
      };
    });
  }
}
