# Import Attribute

https://www.proposals.es/proposals/Import%20Assertions

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#browser_compatibility

## Patterns (2)

```js
// We only want this to be interpreted as JSON,
// not a runnable/malicious JavaScript file with a `.json` extension.

// `with` is still a proposal, and is available starting from TS 5.3
//                          vvvvvvvvvvvvvvvvvvv
import obj from "something" with {type: "json"};

// `assert` is first available in TS 4.5, and is deprecating now
//                          vvvvvvvvvvvvvvvvvvvvv
import obj from 'something' assert {type: 'json'};
```

## Metrics

* #Usage%(Assertable Declaration)

## Tags

* new(TS5.3)
* static
* implicit
