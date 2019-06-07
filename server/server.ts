import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as logger from 'koa-logger'
import * as serve from 'koa-static'
const sse = require('koa-sse-stream');
// import {session} from './OPC_client'
// import {AttributeIds, DataType, VariantArrayType} from 'node-opcua'
import {conn_map} from './routes'
import {client} from './gRPC_client'


var bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

//------ Configs -----//
var static_store = __dirname + "/../public/";

console.log('Local dir is:  ' + __dirname);

app.use( logger() );
app.use( serve( static_store ) );
app.use(bodyParser());

router.use('/read', sse({
    maxClients: 5000,
    pingInterval: 30000
}));

router.get('/read', async (ctx) => {


    var dataValue = await client.ReadOpcNodes().sendMessage({ names: ["ciao"] });

    ctx.body = JSON.stringify(dataValue);
    conn_map.set(ctx.req,ctx.sse);
    ctx.sse.on('close',()=>{console.log('killing connection'); conn_map.delete(ctx.req); });
});

router.post('/write', async (ctx) => {
    console.log(ctx.request.body.var)
    try{
        var status = await client.WriteOpcNode().sendMessage({name : "ciao", value : ctx.request.body.var });
        ctx.body = JSON.stringify(status);
    }
    catch(e){
        ctx.body = JSON.stringify({status:"fail"});
        console.log(e);
    }

});

app.use(router.routes());

app.listen(4000);

setInterval( async () =>{
    
    var dataValue:any;
    if(conn_map.size > 0 ){
        dataValue = await client.ReadOpcNodes().sendMessage({ names: ["ciao"] }); 

        conn_map.forEach( (sse,key) =>{
            sse.send(JSON.stringify(dataValue));
        });
    }
}, 1000 );

console.log('Server running on ---> \t http://localhost:4000');
