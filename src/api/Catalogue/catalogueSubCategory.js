import api from '../axios';
import { SORT } from '../../utils/listSorting';

export const getCatalogueSubCategories = (params) => {
  return api.get('/api/catalogue-subcategory/', { params: { ...SORT.catalogueSubCategory, ...params } });
};

export const createCatalogueSubCategory = (data) => {
  return api.post('/api/catalogue-subcategory/', data);
};

export const updateCatalogueSubCategory = (data) => {
  return api.put('/api/catalogue-subcategory/', data);
};

export const deleteCatalogueSubCategory = (csId) => {
  return api.delete('/api/catalogue-subcategory', { params: { csId } });
};
