import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug('that:api:communications:dataSources:firebase:news');
const { entityDateForge } = utility.firestoreDateForge;
const fields = ['createdAt', 'approvedAt', 'lastUpdatedAt'];
const newsDateForge = entityDateForge({ fields });

function scrubNewsPost({ newsPost, isNew = false, userId }) {
  const scrubbedNewsPost = newsPost;
  const now = new Date();

  if (isNew) {
    scrubbedNewsPost.createdAt = now;
    scrubbedNewsPost.createdBy = userId;
    scrubbedNewsPost.approvedAt = null;
    scrubbedNewsPost.approvedBy = null;
  }
  scrubbedNewsPost.lastUpdatedAt = now;
  scrubbedNewsPost.lastUpdatedBy = userId;
  if (scrubbedNewsPost?.url?.href)
    scrubbedNewsPost.url = scrubbedNewsPost.url.href;

  return scrubbedNewsPost;
}

const news = dbInstance => {
  dlog('news instance created');
  const collectionName = 'news';

  const newsCollection = dbInstance.collection(collectionName);

  function getAll() {
    dlog('get ALL news posts');
    return newsCollection
      .orderBy('createdAt', 'desc')
      .get()
      .then(qrySnap =>
        qrySnap.docs.map(p => {
          const r = {
            id: p.id,
            ...p.data(),
          };
          return newsDateForge(r);
        }),
      );
  }

  function findApproved() {
    dlog('find approved news posts');
    return newsCollection
      .where('approvedAt', '!=', null)
      .get()
      .then(qrySnap =>
        qrySnap.docs.map(n => {
          const r = {
            id: n.id,
            ...n.data(),
          };
          return newsDateForge(r);
        }),
      );
  }

  function findPaged({
    dateFrom = null,
    dateTo = null,
    pageSize = 100,
    cursor = null,
    isApprovedOnly = false,
  }) {
    dlog('findApprovedPage');
    let theLastDoc = null;
    if (cursor) {
      const curObject = Buffer.from(cursor, 'base64').toString('utf-8');
      const { curDateFrom, curDateTo, curPageSize, curLastDoc } =
        JSON.parse(curObject);
      dlog(
        'decoded cursor dateFrom %s, dateTo %s, pageSize %d, lastDoc %s',
        curDateFrom,
        curDateTo,
        curPageSize,
        curLastDoc,
      );

      if (
        curDateFrom !== dateFrom ||
        curDateTo !== dateTo ||
        curPageSize !== pageSize
      ) {
        throw new Error(
          `Invalid cursor provided, value mismatches. Values should remain the same when passing in a cursor.`,
        );
      }
      theLastDoc = curLastDoc;
    }

    /**
     * You cannot have inequality filters on more than one field in firestore
     * In our case createdAt and approvedBy, or approvedAt so we need to filter
     * out the approval after the fact. Yes this will throw off the number of records
     * returned, meaning less than the page number, though that is fine for now.
     * To add a boolean, e.g. isApproved, would allow the query as it is an equality filter
     * thought it would also require another compound index.
     * https://cloud.google.com/appengine/docs/standard/go111/datastore/query-restrictions
     */
    let query = newsCollection;
    if (dateFrom) query = query.where('createdAt', '>=', new Date(dateFrom));
    if (dateTo) query = query.where('createdAt', '<=', new Date(dateTo));
    query = query.orderBy('createdAt', 'desc').limit(pageSize);
    if (theLastDoc) query = query.startAfter(new Date(theLastDoc));

    return query.get().then(qrySnap => {
      dlog('found %d approved posts', qrySnap.size);
      let newsPosts = qrySnap.docs.map(p => {
        const r = {
          id: p.id,
          ...p.data(),
        };
        return newsDateForge(r);
      });
      // filter here due to firestore limitation
      if (isApprovedOnly === true) {
        newsPosts = newsPosts.reduce((acc, cur) => {
          if (cur.approvedAt !== null && cur.approvedBy !== null) acc.push(cur);
          return acc;
        }, []);
      }
      const lastDoc = newsPosts[newsPosts.length - 1];
      let newCursor = '';
      if (lastDoc) {
        const cpieces = JSON.stringify({
          curDateFrom: dateFrom ?? null,
          curDateTo: dateTo ?? null,
          curPageSize: pageSize,
          curLastDoc: lastDoc.createdAt,
        });
        newCursor = Buffer.from(cpieces, 'utf-8').toString('base64');
      }

      return {
        newsPosts,
        cursor: newCursor,
        count: newsPosts.length,
      };
    });
  }

  function findByMemberPaged({
    memberId,
    pageSize = 20,
    cursor = null,
    isApprovedOnly = false,
  }) {
    dlog('find news posts by member %s', memberId);
    let theLastDoc = null;
    if (cursor) {
      const curObject = Buffer.from(cursor, 'base64').toString('utf-8');
      const { curMemberId, curPageSize, curLastDoc } = JSON.parse(curObject);
      dlog(
        'decode cursor memberId %s, pageSize %d, lastDoc %s',
        curMemberId,
        curPageSize,
        curLastDoc,
      );
      if (
        curMemberId !== memberId ||
        curPageSize !== pageSize ||
        curLastDoc == null
      ) {
        throw new Error(
          `Invalid cursor provided, value mismatches. Values should remain the same when passing in a cursor.`,
        );
      }
      theLastDoc = curLastDoc;
    }

    let query = newsCollection
      .where('createdBy', '==', memberId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize);
    if (theLastDoc) query = query.startAfter(new Date(theLastDoc));

    return query.get().then(qrySnap => {
      dlog('return %d records', qrySnap.size);
      let newsPosts = qrySnap.docs.map(p => {
        const r = { id: p.id, ...p.data() };
        return newsDateForge(r);
      });
      if (isApprovedOnly === true) {
        newsPosts = newsPosts.reduce((acc, cur) => {
          if (cur.approvedAt !== null && cur.approvedBy !== null) acc.push(cur);
          return acc;
        }, []);
      }

      const lastDoc = newsPosts[newsPosts.length - 1];
      let newCursor = '';
      if (lastDoc) {
        const cpieces = JSON.stringify({
          curMemberId: memberId,
          curPageSize: pageSize,
          curLastDoc: lastDoc.createdAt,
        });
        newCursor = Buffer.from(cpieces, 'utf-8').toString('base64');
      }

      return {
        newsPosts,
        cursor: newCursor,
        count: newsPosts.length,
      };
    });
  }

  function get(id) {
    dlog('get news post %s', id);
    return newsCollection
      .doc(id)
      .get()
      .then(docSnap => {
        let result = null;
        if (docSnap.exists) {
          result = {
            id: docSnap.id,
            ...docSnap.data(),
          };
        }

        return newsDateForge(result);
      });
  }

  function getApproved(id) {
    dlog('get approved news post %s', id);
    return newsCollection
      .doc(id)
      .get()
      .then(docSnap => {
        let result = null;
        if (docSnap.exists) {
          result = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          if (result.approvedAt === null || result.approvedBy === null)
            result = null;
        }

        return newsDateForge(result);
      });
  }

  function getMemberPost({ memberId, postId }) {
    dlog('get member %s post $s', memberId, postId);

    return newsCollection
      .doc(postId)
      .get()
      .then(docSnap => {
        let result = null;
        if (docSnap.exists) {
          result = {
            id: docSnap.id,
            ...docSnap.data(),
          };
          if (result.createdBy !== memberId) result = null;
        }

        return newsDateForge(result);
      });
  }

  function create({ newsPost, userId }) {
    dlog('creating new newsPost: %o', newsPost);
    const scrubbedPost = scrubNewsPost({ newsPost, isNew: true, userId });

    return newsCollection.add(scrubbedPost).then(newDoc => get(newDoc.id));
  }

  function update({ newsPostId, newsPost, userId }) {
    dlog('updating newsPost: %s, %o', newsPostId, newsPost);
    scrubNewsPost({ newsPost, isNew: false, userId });
    const docRef = newsCollection.doc(newsPostId);

    return docRef.update(newsPost).then(() => get(docRef.id));
  }

  function approve({ newsPostId, userId }) {
    dlog('approving %s', newsPostId);
    const docRef = newsCollection.doc(newsPostId);

    return docRef
      .update({
        approvedAt: new Date(),
        approvedBy: userId,
      })
      .then(() => get(docRef.id));
  }

  function unapprove({ newsPostId, userId }) {
    dlog('unapproving %s', newsPostId);
    const docRef = newsCollection.doc(newsPostId);

    return docRef
      .update({
        approvedAt: null,
        approvedBy: null,
        lastUpdatedBy: userId,
      })
      .then(() => get(docRef.id));
  }

  return {
    getAll,
    findApproved,
    findPaged,
    findByMemberPaged,
    get,
    getApproved,
    getMemberPost,
    create,
    update,
    approve,
    unapprove,
  };
};

export default news;
