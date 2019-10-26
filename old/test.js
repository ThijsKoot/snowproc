var arr = [{'a': 1}, {'a':2}];
var f = arr.filter(a => a.a < 2);
var a = arr.map(item => item.a);
console.log(a);

var count;

const doStuff  = (i) => i + 1;

var obj = {'k1': 'v1', 'k2': 'v2'};

 Object.keys(obj).forEach(o => console.log(o));



console.log(obj);
// Object.keys(obj).forEach(o => console.log(o));


class stateManager {
    constructor() {
        this.state = {num: 0};
    }

    getCurrent() {
        Object.keys(this.state).forEach(key => {
            console.log(`key: ${key}. val: ${this.state[key]}`)
            
        });
        console.log(this.state);
    }

    restore() {
        console.log(this.state);
    }
}

const state = new stateManager();
stateManager
state.getCurrent();
state.restore();
console.log(doStuff(1));