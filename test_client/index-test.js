import {hello} from './index.js';


describe('hello', function(){
    it('should return hello', function(){
        chai.assert.equal(hello(),'hello');
    });
});

