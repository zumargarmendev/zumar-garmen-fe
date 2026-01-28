import api from '../axios';

export const getInventorySubCategories = ({ pageLimit, pageNumber, search = '', orderBy = '', ordering = '', icId, filterIcId }) => {
  const params = {};

  if (pageLimit !== undefined && pageLimit !== null && pageLimit !== null) {
    params.pageLimit = pageLimit;
  }
  if (pageNumber !== undefined && pageNumber !== null && pageLimit !== null) {
    params.pageNumber = pageNumber;
  }
  if (search) params.search = search;
  if (orderBy) params.orderBy = orderBy;
  if (ordering) params.ordering = ordering;
  if (icId !== undefined && icId !== null) {
    params.icId = icId;
  }
  if (filterIcId !== undefined && filterIcId !== null) {
    params.filterIcId = filterIcId;
  }
  return api.get('/api/inventory-subcategory', { params });
};

export const createInventorySubCategory = (data) => {
  // requires icId and isName
  return api.post('/api/inventory-subcategory', data);
};

export const updateInventorySubCategory = (isId, data) => {
  // requires isId, icId, and isName
  return api.put('/api/inventory-subcategory', { isId, ...data });
};

export const deleteInventorySubCategory = (isId) => {
  return api.delete('/api/inventory-subcategory', { params: { isId } });
};

// Mass Upload functions
export const downloadInventorySubCategoryTemplate = () => {
  return api.get('/api/inventory-subcategory/template', {
    responseType: 'blob', // Important for file download
  });
};

export const massUploadInventorySubCategory = (file) => {
  const formData = new FormData();
  formData.append('File', file); // Capital 'F' as per API requirement

  return api.post('/api/inventory-subcategory/mass-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}; 