const obj = {
  foo: function () {
    /* Empty */
  },
  1: () => {
    /* Empty */
  },
};

obj?.foo?.();
// Call to undefined, but no error will be thrown.
obj?.bar?.();

// Call to undefined, but no error will be thrown.
obj?.[0]?.();
obj?.[1]?.();
