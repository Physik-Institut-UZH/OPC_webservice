import {OPCUAClient, ClientSession, ClientSubscription, AttributeIds,resolveNodeId, ClientMonitoredItem, DataType, VariantArrayType} from 'node-opcua'
import {conn_map} from './routes'
import {browse} from './OPC_utils'

// Setting up the client 

export const client = new OPCUAClient({
    requestedSessionTimeout:10000,
    endpoint_must_exist: false,
    //keepSessionAlive: true,
    connectionStrategy: {
        maxRetry: -1,
        initialDelay:1000,
        maxDelay:    5000,
        randomisationFactor: 0
    }
 });
const endpointUrl = "opc.tcp://xeplc.physik.uzh.ch:4840/s7OPC";
//const endpointUrl = "opc.tcp://10.0.0.2:4840/s7OPC";
//const endpointUrl = "opc.tcp://electricSteinbock:4334/UA/MyLittleServer";

export let session;

client.isConnected = false;
client.on('close',()=>{client.isConnected = false;});
client.on('connection_lost',()=>{client.isConnected = false;});
client.on("connection_reestablished", () => {client.isConnected = true;});

// USEFUL for later use
/*  
client.on("connection_reestablished", function () {
    console.log(" !!!!!!!!!!!!!!!!!!!!!!!!  CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!");
});
client.on("backoff", function (number, delay) {
    console.log("backoff  attempt #", number, " retrying in ", delay / 1000.0, " seconds");
    console.log("max retry ", client.connectionStrategy.maxRetry);
    console.log("max keepAlive ", client.requestedMaxKeepAliveCount);
});
client.on("start_reconnection", function () {
    console.log(" !!!!!!!!!!!!!!!!!!!!!!!!  Starting Reconnection !!!!!!!!!!!!!!!!!!!");
});
client.on('close',()=>{console.log('connection closed.... Retry'); });
*/

async function connect (){
    try{ 
        console.log('opc-session started');

        await client.connect(endpointUrl) ;
        client.isConnected = true;
        let endp = await client.getEndpoints({endpointUrl:endpointUrl});
        console.log(endp.toString());
        console.log('connected --> creating session');

        session = await client.createSession();
        
        console.log('session created ---> browsing');
        
        let node_map = await browse(session);

        let res = await session.write(
            {nodeId:"ns=3;s=\"ciao\"", attributeId: AttributeIds.Value, 
//            {nodeId:"ns=1;b=1020FFAA", attributeId: AttributeIds.Value, 
            value: { 
                value:{ 
                    dataType: DataType.Int16, 
                    value: 7, 
                    arrayType: VariantArrayType.Scalar, 
                    dimensions: null
                }
            }} );

        
        
  
        console.log('browsed ---> subscribing');

        let subscription = new ClientSubscription(session,{
            requestedPublishingInterval: 500,
            requestedLifetimeCount: 2,
            requestedMaxKeepAliveCount: 2,
            maxNotificationsPerPublish: 10,
            publishingEnabled: true,
            priority: 10});
        
        
        subscription.on("started",function(){
                console.log("subscription started");
            });
            subscription.on("keepalive",function(){
                console.log("keepalive");
    
            });
            subscription.on("terminated",function(){
                console.log(" TERMINATED ------------------------------>")
                
            });
    
//        let node_id_list =  Array.from(node_map.values()) ;//["ns=1;i=1001", "ns=1;b=1020FFAA"];
        let node_id_list =  ["ns=3;s=\"ciao\""];
        console.log(node_id_list);
        let item_list = [];
        
        for(let index=0; index < node_id_list.length; index++){
            let item = await subscription.monitor(
                {nodeId: resolveNodeId(node_id_list[index]),
                    attributeId: AttributeIds.Value},
                {samplingInterval: 100,
                    discardOldest: true,
                    queueSize: 10
                },
                2
            );
            item.on('changed',(val)=>{
                console.log('has changed -->', val.value.value.toFixed(2));

                conn_map.forEach((sse,key) =>{ 
                    sse.send(`{"var${index+1}":${val.value.value.toFixed(2)}}`);
                });

            item_list.push(item);
                    
                
            }); 

        }
        
    }
    catch(e){
        console.log(e);
    }


}


try{
    connect();
}
catch(e){
    console.log(e);
}

