export default {
  dependencies: ['repo-meta'],
  process: (res) => {
    return {
      'is-monorepo': res.hasWorkspaces || res.hasNxInPkgJson || res.hasLernaJson || res.hasNxJson,
      'max-count-of-packages': Math.max(res.packagesCountByRootDir, res.packagesCountByNamedPkgJson),
    };
  }
};
