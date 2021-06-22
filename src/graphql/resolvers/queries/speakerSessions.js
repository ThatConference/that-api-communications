import { resolveType } from '@thatconference/schema';

const resolveTheSessionsType = resolveType.theSessionsType;

export const fieldResolvers = {
  SpeakerSessions: {
    speaker: ({ speakerId: id }) => ({ id }),
    sessions: ({ sessions }) =>
      sessions.map(s => ({
        id: s.id,
        __typename: resolveTheSessionsType(s.type),
      })),
  },
};
