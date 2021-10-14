interface foo {
  bar: number
}

interface foo2 extends foo {
  bar2: string
}

let c: foo2 = {
  bar: 1,
  bar2: 'string'
}
