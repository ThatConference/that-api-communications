import debug from 'debug';
import newsStore from '../../../dataSources/cloudFirestore/news';

const dlog = debug('that:api:communications:mutation:newsPostMe');

export const fieldResolvers = {
  NewsPostMeMutation: {
    update: (
      { newsPost: currentNewsPost },
      { newsPost },
      { dataSources: { firestore }, user },
    ) => {
      dlog('me update called on %s', currentNewsPost?.id);
      if (!currentNewsPost || currentNewsPost?.createdBy !== user.sub)
        return null;

      return newsStore(firestore).update({
        newsPostId: currentNewsPost.id,
        newsPost,
        memberId: user.sub,
      });
    },
  },
};
