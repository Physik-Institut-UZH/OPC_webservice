const EventEmitter = require('events');
var opcua = require("node-opcua");

// Note:
// the crowler does not work on the S7-1500 OPC server, spits the following error:
// "NodeCrawler doesn't support continuation point yet"
//
// The only way left is to do a "manual" crawl with a specific path ObjectFolder->DeviceSet->PLC
// this is the most efficient way since PLC values exist either in DeviceSet and standalone,
// this is to avoid to scann all variables twice.


class NodePicker extends EventEmitter {
    constructor(session){
        super();
        this.session = session;
        this.regexList = [];
        this.exactMatchList = [];
        this.NameToID = new Map();
        this.on("browsed",this.pickNodes);

        
    }

    async read(node) {
        let b;
        let result;
        if(node) {
           b = [{
            nodeId: node.nodeId,
            referenceTypeId: "Organizes",
            includeSubtypes: true,
            browseDirection: opcua.BrowseDirection.Forward,
            resultMask: 0x3f

        }];
            result = await this.session.browse(b);
            this.emit('browsed', result[0]);

        }
        else {
            result = await this.session.browse('ObjectsFolder');
            this.emit('browsed', result);
        }

        //console.log('---------------> ',result.toString());
    }

    registerVars(vars){
        if(typeof(vars) === "object" && Array.isArray(vars))
            this.exactMatchList = this.exactMatchList.concat(vars);
        else (typeof(vars) === "string")
            this.exactMatchList.push(vars);
    }
    registerRegex(vars){
        if(typeof(vars) === "object" && Array.isArray(vars))
            this.regexList = this.regexList.concat(vars);
        else (typeof(vars) === "string")
            this.regexList.push(vars);
    }
    
    pickNodes(element){
        if(element){
            for(let x of element.references){
                console.log(x.browseName.name, x.nodeId.toString() );
                this.read(x);
            }
        }
        /*if( this.exactMatchList.includes(element.browseName.name) ){
            this.NameToID.set(element.browseName.name, element.nodeId.toString());
            console.log("matched");
        }*/
    }
    async getNameToNodeMap(){
        
        //let obj = await this.read();
        //return this.NameToID;
    }
}

export async function browse(session){
    
    var picker = new NodePicker(session);
    //picker.registerVars(["ciao"]);
    //let mappa = await picker.getNameToNodeMap();
    //console.log('Found variables:')
    //console.log('   ', mappa);
    //return mappa;
    picker.read();
}