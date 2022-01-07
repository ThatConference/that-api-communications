import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug('that:api:communications:dataSources:firebase:news');
const { entityDateForge } = utility.firestoreDateForge;
const fields = ['createdAt', 'approvedAt', 'lastUpdatedAt'];
const newsDateForge = entityDateForge({ fields });

function scrubNewsPost({ newsPost, isNew = false, memberId }) {
  const scrubbedNewsPost = newsPost;
  const now = new Date();

  if (isNew) {
    scrubbedNewsPost.createdAt = now;
    scrubbedNewsPost.createdBy = memberId;
    scrubbedNewsPost.approvedAt = null;
    scrubbedNewsPost.approvedBy = null;
    // isApproved field needed for inequality filter restriction in firestore
    scrubbedNewsPost.isApproved = false;
  }
  scrubbedNewsPost.lastUpdatedAt = now;
  scrubbedNewsPost.lastUpdatedBy = memberId;
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
      .where('isApproved', '==', true)
      .orderBy('createdAt', 'desc')
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
      const {
        curDateFrom,
        curDateTo,
        curPageSize,
        curIsApprovedOnly,
        curLastDoc,
      } = JSON.parse(curObject);
      dlog(
        'decoded cursor dateFrom %s, dateTo %s, pageSize %d, isApproved %o, lastDoc %s',
        curDateFrom,
        curDateTo,
        curPageSize,
        curIsApprovedOnly,
        curLastDoc,
      );

      if (
        curDateFrom !== dateFrom ||
        curDateTo !== dateTo ||
        curPageSize !== pageSize ||
        curIsApprovedOnly !== isApprovedOnly ||
        curLastDoc === null
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
     * out the approval after the fact which leads to paging issues.
     * isApproved boolean added to have an equality filter for posts
     * https://cloud.google.com/appengine/docs/standard/go111/datastore/query-restrictions
     */
    let query = newsCollection;
    if (isApprovedOnly === true)
      query = query.where('isApproved', '==', isApprovedOnly);
    if (dateFrom) query = query.where('createdAt', '>=', new Date(dateFrom));
    if (dateTo) query = query.where('createdAt', '<=', new Date(dateTo));
    query = query.orderBy('createdAt', 'desc').limit(pageSize);
    if (theLastDoc) query = query.startAfter(new Date(theLastDoc));

    return query.get().then(qrySnap => {
      dlog('found %d posts', qrySnap.size);
      const newsPosts = qrySnap.docs.map(p => {
        const r = {
          id: p.id,
          ...p.data(),
        };
        return newsDateForge(r);
      });

      const lastDoc = newsPosts[newsPosts.length - 1];
      let newCursor = '';
      if (lastDoc) {
        const cpieces = JSON.stringify({
          curDateFrom: dateFrom ?? null,
          curDateTo: dateTo ?? null,
          curPageSize: pageSize,
          curIsApprovedOnly: isApprovedOnly,
          curLastDoc: lastDoc.createdAt,
        });
        newCursor = Buffer.from(cpieces, 'utf-8').toString('base64');
      }

      return {
        newsPosts,
        cursor: newCursor,
        count: qrySnap.size,
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
      const { curMemberId, curPageSize, curIsApprovedOnly, curLastDoc } =
        JSON.parse(curObject);
      dlog(
        'decode cursor memberId %s, pageSize %d, isApproved %o, lastDoc %s',
        curMemberId,
        curPageSize,
        curIsApprovedOnly,
        curLastDoc,
      );
      if (
        curMemberId !== memberId ||
        curPageSize !== pageSize ||
        curIsApprovedOnly !== isApprovedOnly ||
        curLastDoc == null
      ) {
        throw new Error(
          `Invalid cursor provided, value mismatches. Values should remain the same when passing in a cursor.`,
        );
      }
      theLastDoc = curLastDoc;
    }

    let query = newsCollection.where('createdBy', '==', memberId);
    if (isApprovedOnly === true)
      query = query.where('isApproved', '==', isApprovedOnly);

    query = query.orderBy('createdAt', 'desc').limit(pageSize);
    if (theLastDoc) query = query.startAfter(new Date(theLastDoc));

    return query.get().then(qrySnap => {
      dlog('return %d records', qrySnap.size);
      const newsPosts = qrySnap.docs.map(p => {
        const r = { id: p.id, ...p.data() };
        return newsDateForge(r);
      });

      const lastDoc = newsPosts[newsPosts.length - 1];
      let newCursor = '';
      if (lastDoc) {
        const cpieces = JSON.stringify({
          curMemberId: memberId,
          curPageSize: pageSize,
          curIsApprovedOnly: isApprovedOnly,
          curLastDoc: lastDoc.createdAt,
        });
        newCursor = Buffer.from(cpieces, 'utf-8').toString('base64');
      }

      return {
        newsPosts,
        cursor: newCursor,
        count: qrySnap.size,
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

  function create({ newsPost, memberId }) {
    dlog('creating new newsPost: %o', newsPost);
    const scrubbedPost = scrubNewsPost({ newsPost, isNew: true, memberId });

    return newsCollection.add(scrubbedPost).then(newDoc => get(newDoc.id));
  }

  function update({ newsPostId, newsPost, memberId }) {
    dlog('updating newsPost: %s, %o', newsPostId, newsPost);
    scrubNewsPost({ newsPost, isNew: false, memberId });
    const docRef = newsCollection.doc(newsPostId);

    return docRef.update(newsPost).then(() => get(docRef.id));
  }

  function approve({ newsPostId, memberId }) {
    dlog('approving %s', newsPostId);
    const docRef = newsCollection.doc(newsPostId);

    return docRef
      .update({
        approvedAt: new Date(),
        approvedBy: memberId,
        isApproved: true,
      })
      .then(() => get(docRef.id));
  }

  function unapprove({ newsPostId, memberId }) {
    dlog('unapproving %s', newsPostId);
    const docRef = newsCollection.doc(newsPostId);

    return docRef
      .update({
        approvedAt: null,
        approvedBy: null,
        isApproved: false,
        lastUpdatedBy: memberId,
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
