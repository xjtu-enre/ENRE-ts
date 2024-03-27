export default {
  dependencies: ['repo-meta'],
  process: (res) => {
    return {
      'has-subpath-exports': res.hasSubpathExports,
    };
  }
};
