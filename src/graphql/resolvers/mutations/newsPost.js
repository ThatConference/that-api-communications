import debug from 'debug';
import newsStore from '../../../dataSources/cloudFirestore/news';

const dlog = debug('that:api:communications:mutation:newsPost');

export const fieldResolvers = {
  NewsPostMutation: {
    update: (
      { newsPost: currentNewsPost },
      { newsPost },
      { dataSources: { firestore }, user },
    ) => {
      dlog('update called on %s', currentNewsPost?.id);
      if (!currentNewsPost || currentNewsPost?.createdBy !== user.sub)
        return null;

      return newsStore(firestore).update({
        newsPostId: currentNewsPost.id,
        newsPost,
        userId: user.sub,
      });
    },
    approve: ({ newsPost }, __, { dataSources: { firestore }, user }) => {
      dlog('approve called on newsPost %s', newsPost?.id);
      if (!newsPost) return null;

      return newsStore(firestore).approve({
        newsPostId: newsPost.id,
        userId: user.sub,
      });
    },
    unapprove: ({ newsPost }, __, { dataSources: { firestore }, user }) => {
      dlog('unapprove called on newsPost %s', newsPost?.id);
      if (!newsPost) return null;

      return newsStore(firestore).unapprove({
        newsPostId: newsPost.id,
        userId: user.sub,
      });
    },
  },
};
