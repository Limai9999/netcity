async function getClassUsers({vk, classes, type, peerId}) {
  const allClasses = await classes.getAllClasses();
  const classesIds = allClasses
      .map((classData) => classData.id)
      .filter((id) => id > 2000000000);

  const result = await Promise.all(classesIds.map(async (classId) => {
    const response = await vk.getConversationMembers(classId);
    if (!response) return;

    const {count, profiles} = response;
    if (count === 0) return;

    const members = profiles.map((profile) => {
      const {id, first_name, last_name, online} = profile;

      const name = `${first_name} ${last_name}`;
      const link = `[id${id}|${name}]`;

      const resultString = `${id}: ${link} - ${online ? '🟢' : '🔴'}`;
      return {id, name, link, resultString};
    });

    return {
      fullData: profiles,
      classId,
      totalMembers: count,
      members,
    };
  }));

  if (type === 'array') {
    const resultArray = [];

    result.map((res) => {
      res.members.map((member) => {
        resultArray.push(member);
      });
    });

    return resultArray;
  }

  // await classes.setUsers(result, peerId);

  return result;
}

module.exports = getClassUsers;
