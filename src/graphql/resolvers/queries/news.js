import debug from 'debug';
import newsStore from '../../../dataSources/cloudFirestore/news';

const dlog = debug('that:api:communications:query:news');

export const fieldResolvers = {
  NewsQuery: {
    approved: (
      _,
      { dateFrom, dateTo, pageSize, cursor },
      { dataSources: { firestore } },
    ) => {
      dlog('all approved requested');
      const maxPageSize = 500;
      if (pageSize > maxPageSize)
        throw new Error(`Approved news max page size is ${maxPageSize}`);

      return newsStore(firestore).findPaged({
        dateFrom,
        dateTo,
        pageSize,
        cursor,
        isApprovedOnly: true,
      });
    },
    approvedPost: (_, { id }, { dataSources: { firestore } }) => {
      dlog('approved post requested %s', id);
      return newsStore(firestore).getApproved(id);
    },
    postsByMember: (
      _,
      { memberId, pageSize, cursor },
      { dataSources: { firestore } },
    ) => {
      dlog('query posts by member %s', memberId);
      const maxPageSize = 100;
      if (pageSize > maxPageSize)
        throw new Error(`Approved news max page size is ${maxPageSize}`);
      return newsStore(firestore).findByMemberPaged({
        memberId,
        pageSize,
        cursor,
        isApprovedOnly: true,
      });
    },
    me: () => ({}),
    admin: () => ({}),
  },
};
