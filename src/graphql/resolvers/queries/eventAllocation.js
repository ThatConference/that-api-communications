import { resolveType } from '@thatconference/schema';

const resolveProductType = resolveType.productType;

export const fieldResolvers = {
  EventAllocation: {
    event: ({ event: id }) => ({ id }),
    allocatedTo: ({ allocatedTo: id }) => (id ? { id } : null),
    purchasedBy: ({ purchasedBy: id }) => ({ id }),
    product: ({ product, productType }) => ({
      id: product,
      __typename: resolveProductType(productType),
    }),
  },
};
