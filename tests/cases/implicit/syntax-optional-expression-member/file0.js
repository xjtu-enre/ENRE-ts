const obj = {
  foo: function () {
    /* Empty */
  },
  1: () => {
    /* Empty */
  },
};

obj?.foo?.();
obj?.bar?.();       // Call to undefined, but no error will be thrown.

obj?.[0]?.();       // Call to undefined, but no error will be thrown.
obj?.[1]?.();
