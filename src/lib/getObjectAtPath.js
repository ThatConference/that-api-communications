import debug from 'debug';

const dlog = debug('that:api:communications:lib');

export default function getObjectAtPath(obj, path) {
  dlog('getObjectAtPath (%s)', path);
  let data = obj;
  const pathParts = path.split('.');
  for (let i = 0; i < pathParts.length; i += 1) {
    data = data[pathParts[i]];
    if (!data) break;
  }
  return data;
}
