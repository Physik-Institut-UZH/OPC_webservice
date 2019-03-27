import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as logger from 'koa-logger';
import * as serve from 'koa-static';


const app = new Koa();
const router = new Router();

//------ Configs -----//
var static_store = __dirname + "/../public/";

console.log('Local dir is:  ' + __dirname);

app.use( logger() );
app.use( serve( static_store ) );

router.get('/', async (ctx) => {
    ctx.body = 'Hello World!';
   
});

app.use(router.routes());

app.listen(4000);

console.log('Server running on ---> \t http://localhost:4000');
