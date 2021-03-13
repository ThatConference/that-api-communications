import _ from 'lodash';
import getObjectAtPath from '../getObjectAtPath';

const baseObject = {
  member: {
    firstName: 'Sally',
    lastName: 'Member',
    email: 'sally.member@example.com',
  },
  purchasedBy: {
    firstName: 'Susan',
    lastName: 'Member',
    email: 'susan.member@example.com',
  },
  event: {
    name: 'THAT Confrence',
    startDate: new Date('2021-03-12T21:40:40.431Z'),
    endDate: new Date('2021-03-12T21:40:40.431Z'),
  },
};

describe('getObjectAtPath tests', () => {
  let clone = {};
  beforeEach(() => (clone = JSON.parse(JSON.stringify(baseObject))));

  afterEach(() => (clone = {}));

  describe('paths resolved correctly', () => {
    it('will find event name', () => {
      const result = getObjectAtPath(clone, 'event.name');
      expect(result).toBe(baseObject.event.name);
    });
    it('will find member email', () => {
      const result = getObjectAtPath(clone, 'member.email');
      expect(result).toBe(baseObject.member.email);
    });
  });

  describe('incorrect paths will be handled', () => {
    it('will return undefined for unknown first level', () => {
      const result = getObjectAtPath(clone, 'this.doesnt.exist');
      expect(result).toBe(undefined);
    });
    it('will return undefined for unknown later level', () => {
      const result = getObjectAtPath(clone, 'purchasedBy.foo');
      expect(result).toBe(undefined);
    });
    it('will return undefined for an incorrect deep path', () => {
      const result = getObjectAtPath(clone, 'member.firstName.foo.bar');
      expect(result).toBe(undefined);
    });
  });
});
