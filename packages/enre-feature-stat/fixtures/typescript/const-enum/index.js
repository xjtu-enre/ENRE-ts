export default {
  dependencies: ['all-enums'],
  process: (res) => {
    const
      allEnums = res.allEnums.length,
      allEnumIds = res.allEnums.map(e => e.enumOid),
      constEnums = res.constEnum.filter(e => allEnumIds.includes(e.enumOid)).length;

    return {
      'all-enums': allEnums,
      'const-enums': constEnums,
      'feature-usage-against-enum-declaration': constEnums / allEnums,
    };
  }
};
