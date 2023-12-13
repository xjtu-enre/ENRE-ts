function func() {
  /* Empty */
}

const a = func;
const b = undefined;

a?.();
b?.();
// If call `b` is not optional, an error will be thrown.
// However, if it is optional, the error will be silently ignored.
