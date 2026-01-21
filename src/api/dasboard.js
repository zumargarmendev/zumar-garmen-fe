import api from "./axios";

export const getDashboardDataAuto = (params) => {
  return api.get("/api/dashboard/get-auto", { params });
};

// Old rank-user-order
// export const getDashboardRankUserOrderData = (params) => {
//   return api.get("/api/dashboard/rank-user-order", { params });
// };

// Rank users by purchase value
export const getDashboardRankUserPurchaseData = (params) => {
  return api.get("/api/dashboard/rank-user-purchase", { params });
};

export const getCatalogueCategoryResume = (params) => {
  return api.get("/api/dashboard/get-catalogue-category-resume", { params });
};
