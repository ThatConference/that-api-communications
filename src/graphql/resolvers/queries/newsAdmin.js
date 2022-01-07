import debug from 'debug';
import newsStore from '../../../dataSources/cloudFirestore/news';

const dlog = debug('that:api:communications:query:newsAdmin');

export const fieldResolvers = {
  NewsAdminQuery: {
    all: (
      _,
      { dateFrom, dateTo, pageSize, cursor },
      { dataSources: { firestore } },
    ) => {
      dlog('all requested');
      return newsStore(firestore).findPaged({
        dateFrom,
        dateTo,
        pageSize,
        cursor,
        isApprovedOnly: false,
      });
    },
    post: (_, { id }, { dataSources: { firestore } }) => {
      dlog('post requested %s', id);
      return newsStore(firestore).get(id);
    },
  },
};
