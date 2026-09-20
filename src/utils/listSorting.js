const desc = (orderBy) => ({ orderBy, ordering: 'desc' });

export const SORT = {
  inventory: desc('iId'),
  inventoryCategory: desc('icId'),
  inventorySubCategory: desc('isId'),
  warehouse: desc('iwId'),
  relocation: desc('irId'),
  catalogueProduct: desc('cpId'),
  catalogueCategory: desc('ccId'),
  catalogueSubCategory: desc('csId'),
  order: desc('oId'),
  role: desc('rId'),
  rabTemplate: desc('outId'),
  user: desc('uCreatedAt descending, uId'),
};
