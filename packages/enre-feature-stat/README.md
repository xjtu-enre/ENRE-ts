# Language Feature Profiling

> This package is not an ENRE functioning component, but a peripheral documentation
> package.

This package categorizes language features in JavaScript and TypeScript that have impacts
on the static analysis, and it also
provides [CodeFuse-Query](https://github.com/codefuse-ai/CodeFuse-Query) Godel query
scripts for performing statistic experiments (Some statistic metrics may require
additional processing other than Godel query).

Under the `src` directory, the first level directories are the `group` of language
features, and its sub-directories are each individual `feature`s. Each feature contains
a `README.md` file to describe its pattern and metrics that we interested in, and a
correlated Godel script.
