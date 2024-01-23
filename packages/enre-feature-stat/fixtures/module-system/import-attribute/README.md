# Import Attribute

## Patterns

```js
// We only want this to be interpreted as JSON,
// not a runnable/malicious JavaScript file with a `.json` extension.

//                                 vvvvvvvvvvvvvvvvvvv
import obj from "./something.json" with {type: "json"};
```

## Metrics

* #Usage%
* Attribute type
