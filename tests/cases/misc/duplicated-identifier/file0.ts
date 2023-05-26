const foo = 1;

function bar() {
  interface foo {
    p: number,
  }

  const a: foo = {p: 1};
  console.log(foo);
}
