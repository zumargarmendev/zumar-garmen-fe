import api from "../axios";
import { SORT } from '../../utils/listSorting';

const USER_ENDPOINT = '/user';

export const getUserList = ({
  pageLimit,
  pageNumber,
  search,
  orderBy = SORT.user.orderBy,
  ordering = SORT.user.ordering,
  filterRId = null,
} = {
    pageLimit: 1,
    pageNumber: 1,
    search: "",
    orderBy: SORT.user.orderBy,
    ordering: SORT.user.ordering,
    filterRId: null,
  }) => {
  return api.get(USER_ENDPOINT, {
    params: {
      pageLimit,
      pageNumber,
      search,
      orderBy,
      ordering,
      filterRId,
    }
  });
};

export const createUser = (payload) => {
  return api.post(USER_ENDPOINT, payload);
};

export const updateUser = (payload) => {
  return api.put(`${USER_ENDPOINT}`, payload);
};

export const deleteUser = (uId) => {
  return api.delete(`${USER_ENDPOINT}`, {
    params: { uId }
  });
};
