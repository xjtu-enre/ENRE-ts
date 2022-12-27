interface String {
  formatENRE: (...args: (string | number)[]) => string,
}

/**
 * Replace {n} patterns in the raw string with corresponding arguments.
 */
String.prototype.formatENRE = function (...args: (string | number)[]) {
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined'
      ? args[number] as string
      : match
      ;
  });
};
