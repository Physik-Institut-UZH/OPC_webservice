var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
const grpc_promise = require('grpc-promise');;


var PROTO_PATH = __dirname + '/opc.grpc.connect.proto';

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true,

    });

var grpc_connect = grpc.loadPackageDefinition(packageDefinition).OpcGrpcConnect;

export var client:any;

try{
  client = new grpc_connect.Http('localhost:50051', grpc.credentials.createInsecure());
  grpc_promise.promisifyAll(client);
}
catch{
  console.log("No Server running");
}


  
  /*client.ReadOpcNodes()
    .sendMessage({ names: ["ciao"] })
    .then(response => {
      console.log('Greeting:', response);
      var unixTimeZero = Date.parse( response.nodes[0].timestamp )
      console.log(unixTimeZero)
    })
    .catch(err => {
      console.log('Greeting:', err);
    });

  var resp = await client.WriteOpcNode().sendMessage({name : "ciao", value : "56" });
  console.log('Greeting:', resp);
  
}

*/


