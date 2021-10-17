let { a = 1, b = 2, c } = { a: 11, c: 13, d: 14 }
// `a`, `b`, `c` equals to 11, 2, 13 respectively
// Note that the default value of `a` is overrode

// If no default value is set, `undefined` will be returned
let { foo, bar = 1 } = { bar: 11 }
// `foo` equals to `undefined`
