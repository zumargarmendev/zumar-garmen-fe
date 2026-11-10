import { LucidePackage, ShoppingCart, Wallet } from "lucide-react";
import React from "react";
import {
  getCatalogueCategoryResume,
  getDashboardDataAuto,
} from "../../../api/dasboard";
import { formatCurrency } from "../../../utils";
import { CategoryRecapCard } from "./category-recap-card";
import SummaryCard from "./summary-card";

const getOrderDetails = (data) => {
  return [
    { label: "Menunggu Konfirmasi", value: data?.orderPendingTotal || 0 },
    { label: "Dibuat", value: data?.orderProgressTotal || 0 },
    { label: "Selesai", value: data?.orderFinishTotal || 0 },
    { label: "Ditolak", value: data?.orderRejectedTotal || 0 },
    { label: "Belum Lunas", value: data?.orderNotFullyPaidTotal || 0 },
    { label: "Lunas", value: data?.orderFullyPaidTotal || 0 },
  ];
};

const getRevenueDetails = (data) => {
  return [
    {
      label: "Total Uang Diterima",
      value:
        (data?.orderDownPaymentTotalActive || 0) +
        (data?.orderPaidTotalActive || 0),
    },
    {
      label: "— di antaranya DP",
      value: data?.orderDownPaymentTotalActive || 0,
    },
    {
      label: "Uang Diterima dari Order Selesai",
      value:
        (data?.orderDownPaymentTotalDoneProgress || 0) +
        (data?.orderPaidTotalDoneProgress || 0),
    },
    { label: "Total Piutang", value: data?.orderReceivablesTotalActive || 0 },
    {
      label: "Nilai Order Belum Lunas — Belum Dibayar",
      value: data?.orderValueUnpaidTotal || 0,
    },
    {
      label: "Nilai Order Belum Lunas — Bayar DP",
      value: data?.orderValueDownPaymentTotal || 0,
    },
    { label: "Total HPP (COGS)", value: data?.orderCogsTotalActive || 0 },
    { label: "Total Margin", value: data?.orderMarginTotalActive || 0 },
  ];
};

const getProfitDetails = (data) => {
  return [
    { label: "Maintenance - Develop", value: data?.orderMainDevelopTotalDoneProgress || 0 },
    { label: "Bonus Insentif", value: data?.orderIncentiveTotalDoneProgress || 0 },
    { label: "Pendapatan Marketing", value: data?.orderMarketingTotalDoneProgress || 0 },
    { label: "Sisa Untung Bersih", value: data?.orderProfitNetTotalDoneProgress || 0 },
  ];
};

export function OrderAndFinancialStatus({ filterDateStart, filterDateFinish, onDataLoaded, onCategoryDataLoaded }) {
  const [dashboardAutoData, setDashboardAutoData] = React.useState(null);
  const [catalogueCategoryResume, setCatalogueCategoryResume] =
    React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchData = async ({ filterDateStart, filterDateFinish }) => {
    try {
      setIsLoading(true);
      setError(null);

      const [dashboardResponse, catalogueCategoryResume] = await Promise.all([
        getDashboardDataAuto({
          filterDateStart,
          filterDateFinish,
        }),
        getCatalogueCategoryResume({
          filterDateStart,
          filterDateFinish,
        }),
      ]);

      console.debug("Dashboard Auto Data:", dashboardResponse.data.data);

      console.debug("Rekap Kategori Data:", catalogueCategoryResume.data.data);

      setDashboardAutoData(dashboardResponse.data.data);
      setCatalogueCategoryResume(catalogueCategoryResume.data.data);
      
      if (onDataLoaded) onDataLoaded(dashboardResponse.data.data);
      if (onCategoryDataLoaded) onCategoryDataLoaded(catalogueCategoryResume.data.data);
    } catch (error) {
      setError("Gagal memuat data dashboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData({
      filterDateStart,
      filterDateFinish,
    });
  }, [filterDateStart, filterDateFinish]);

  if (isLoading) {
    return <div>Memuat data...</div>;
  }

  if (error) {
    return <div>Gagal memuat data</div>;
  }

  if (!dashboardAutoData || !catalogueCategoryResume) {
    return <div>Tidak ada data tersedia</div>;
  }

  const rekapKategoriDetails = catalogueCategoryResume?.map((category) => ({
    categoryTitle: category.ccName,
    stats: [
      { label: "Jumlah", value: category.amount },
      { label: "Pendapatan", value: category.totalOff },
      { label: "HPP", value: category.cogs },
    ],
  }));

  return (
    <div className="bg-gray-100 rounded-xl shadow p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 grid items-start">
      <SummaryCard
        title="Total Pesanan"
        value={dashboardAutoData?.orderTotal || 0}
        icon={LucidePackage}
        details={getOrderDetails(dashboardAutoData)}
        color="deep-purple"
      />

      <SummaryCard
        title="Total Nilai Order"
        value={formatCurrency(dashboardAutoData?.orderPriceTotalActive || 0)}
        icon={Wallet}
        details={getRevenueDetails(dashboardAutoData)}
        color="amber"
        isCurrency
      />

      <SummaryCard
        title="Total Sisa Untung"
        value={formatCurrency(
          dashboardAutoData?.orderProfitRemainingTotalDoneProgress || 0,
        )}
        icon={ShoppingCart}
        details={getProfitDetails(dashboardAutoData)}
        color="teal"
        isCurrency
      />

      <CategoryRecapCard
        title="Rekap Kategori"
        details={rekapKategoriDetails}
        color="orange"
        icon={LucidePackage}
        value={`${rekapKategoriDetails?.length || 0} Kategori`}
      />
    </div>
  );
}
