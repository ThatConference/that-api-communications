import debug from 'debug';
import newsStore from '../../../dataSources/cloudFirestore/news';

const dlog = debug('that:api:communications:mutation:news');

export const fieldResolvers = {
  NewsMutation: {
    newsPost: (_, { id }, { dataSources: { firestore } }) => {
      dlog('newsPost mutation on newsPost: %s', id);
      return newsStore(firestore)
        .get(id)
        .then(newsPost => ({ newsPost }));
    },
    create: (_, { newsPost }, { dataSources: { firestore }, user }) => {
      dlog('create newspost %o', newsPost);
      return newsStore(firestore).create({ newsPost, memberId: user.sub });
    },
  },
};
