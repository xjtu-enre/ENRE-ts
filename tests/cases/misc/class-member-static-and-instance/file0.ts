class C {
  x = 1;          // Instance member
  static x = 2;   // Static member
}

console.log(new C().x);
console.log(C.x);
