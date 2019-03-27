//import _ from 'lodash';
export function hello() {
    return 'hello';
}
function component(greetings) {
    let element = document.createElement('div');
    //element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    element.innerHTML = 'Hello World! <br> ' + greetings;
    return element;
}
class Student {
    constructor(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}
function resolveAfter2Seconds() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 2000);
    });
}
async function asyncCall() {
    console.log('calling');
    var result = await resolveAfter2Seconds();
    console.log(result);
    document.body.appendChild(component('From Async!'));
    // expected output: 'resolved'
}
asyncCall();
// document.body.appendChild(component('fuck your majesty...'));
//# sourceMappingURL=index.js.map