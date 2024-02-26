import {toFixed} from '../../_utils/post-process.js';

export default {
  dependencies: ['all-classes', 'all-class-members'],
  process: (clz, clzMember) => {
    let
      privateIdentifierName = 0,
      classOidContainingPrivateName = new Set();

    for (const member of clzMember) {
      if (member.memberNameNodeType === 'PrivateIdentifier') {
        privateIdentifierName += 1;
        classOidContainingPrivateName.add(member.classOid);
      }
    }

    const
      allClassesCount = clz.allClasses.length,
      allClassMembersCount = clzMember.length;

    return {
      'class/private-member': {
        'all-classes': allClassesCount,
        'class-containing-private-identifier': classOidContainingPrivateName.size,
        'feature-usage-against-class': toFixed(classOidContainingPrivateName.size / allClassesCount),

        'all-class-members': allClassMembersCount,
        'private-identifiers': privateIdentifierName,
        'feature-usage-against-all-members': toFixed(privateIdentifierName / allClassMembersCount),
      }
    };
  },
};
