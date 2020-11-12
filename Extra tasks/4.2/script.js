const add=(a,b=null) => b !== null?  a+b : (c)=> a+c;
const sub=(a,b=null) => b !== null?  b-a : (c)=> c-a;
const mul=(a,b=null) => b !== null?  a*b : (c)=> a*c;
const div=(a,b=null) => b !== null?  b/a : (c)=> c/a;

const _pipe = (a,b) => (arg) => b(a(arg));
const pipe = (...fns) => fns.reduce(_pipe);

console.log('1+5='+add(1)(5),
            '41-2='+sub(2,41),
            '3*5='+mul(3,5),
            '15/2='+div(2)(15))
console.log('((((8+12)*2)-5)*3)/6='+pipe(add(12), mul(2),sub(5),mul(3),div(6))(8));

