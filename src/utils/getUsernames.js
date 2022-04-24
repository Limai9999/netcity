/* eslint-disable no-inner-declarations */
module.exports = (vk, stats) => {
  return new Promise(resolve => {
    try {
      const userIds = [];

      splitGroups();

      function splitGroups() {
        stats.map((r, i) => {
          saveAllIds(r, i);
        });
      }

      function saveAllIds(res, i) {
        res.messages.map(r => {
          if (userIds.find(e => e.userId === r.userId)) return;
          userIds.push({
            groupId: res.groupId,
            userId: r.userId,
            name: null
          });
        });

        if (i + 1 >= stats.length) return pushToArr();
      }

      function pushToArr() {
        const arr = [];

        userIds.map(r => {
          arr.push(r.userId);
        });

        findNamesForIds(arr.join(','));
      }

      async function findNamesForIds(user_ids) {
        const response = await vk.call('users.get', {
          user_ids
        });

        const arrayRes = Array.from(response);

        arrayRes.map(r => {
          const element = userIds.find(e => e.userId == r.id);
          if (!element) return;
          element.name = `${r.first_name} ${r.last_name}`;
        });

        return resolve(userIds);
      }
    } catch (error) {
      console.log('Ошибка при получении имён:', error);
      return false;
    }
  });
};
