import debug from 'debug';
import newsStore from '../../../dataSources/cloudFirestore/news';

const dlog = debug('that:api:communications:query:me:news');

export const fieldResolvers = {
  NewsMeQuery: {
    all: (_, { pageSize, cursor }, { dataSources: { firestore }, user }) => {
      dlog('all me posts requested');
      const maxPageSize = 100;
      if (pageSize > maxPageSize)
        throw new Error(`Approved news max page size is ${maxPageSize}`);
      return newsStore(firestore).findByMemberPaged({
        memberId: user.sub,
        pageSize,
        cursor,
      });
    },
    post: (_, { id: postId }, { dataSources: { firestore }, user }) => {
      dlog('my post with id %s', postId);
      return newsStore(firestore).getMemberPost({ memberId: user.sub, postId });
    },
  },
};
