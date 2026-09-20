import api from '../axios';
import { SORT } from '../../utils/listSorting';

export const getCatalogueCategories = (params) => {
  return api.get('/api/catalogue-category/', { params: { ...SORT.catalogueCategory, ...params } });
};

export const createCatalogueCategory = (data) => {
  return api.post('/api/catalogue-category/', data);
};

export const updateCatalogueCategory = (data) => {
  return api.put('/api/catalogue-category/', data);
};

export const deleteCatalogueCategory = (ccId) => {
  return api.delete('/api/catalogue-category', { params: { ccId } });
};
