import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Generic Distribution Pie Chart Component
const DistributionPieCharts = ({ data, title, colors, className = "" }) => {
  // Default colors if none provided
  const defaultColors = [
    "#FF6B6B",
    "#45B7D1",
    "#FECA57",
    "#6C5CE7",
    "#A29BFE",
    "#FD79A8",
  ];
  const chartColors = colors || defaultColors;

  // Transform API data for recharts format
  // Transform API data for recharts format
  const transformDataForPieChart = (dataArray, labelKey, valueKey = "count") => {
    if (!dataArray || !Array.isArray(dataArray)) return [];

    // Step 1: Normalize and group by lowercased name
    const grouped = dataArray.reduce((acc, item) => {
      let key = (item[labelKey] || "UNPAID").trim();
      if (!key) key = "UNPAID"; // Handle empty string as "Unknown"

      const normalizedKey = key.toLowerCase(); // Normalize casing

      if (!acc[normalizedKey]) {
        acc[normalizedKey] = {
          name: key.charAt(0).toUpperCase() + key.slice(1), // Format display name
          value: 0,
          total: 0,
          count: 0,
        };
      }

      acc[normalizedKey].value += parseFloat(item[valueKey]) || 0;
      acc[normalizedKey].count += parseInt(item.count) || 0;
      acc[normalizedKey].total += parseFloat(item.total) || 0;

      return acc;
    }, {});

    // Step 2: Convert grouped object back to an array
    return Object.values(grouped);
  };


  // Determine the label key based on data structure
  const getLabelKey = (dataArray) => {
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0)
      return "name";
    const firstItem = dataArray[0].payment_type != "" ? dataArray[0] : dataArray[1];
    if (firstItem?.payment_type) return "payment_type";
    if (firstItem?.order_type) return "order_type";
    if (firstItem?.source) return "source";
    return "name";
  };

  const labelKey = getLabelKey(data);
  const chartData = transformDataForPieChart(data, labelKey);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalSum = payload[0].payload.totalSum || 1;
      const percentage = ((data.value / totalSum) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">Orders: {data.count}</p>
          <p className="text-sm text-gray-600">Total: {data.total}</p>
          <p className="text-sm text-gray-600">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // Handle empty or invalid data
  if (!chartData || chartData.length === 0) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <h3
          className="text-lg font-semibold mb-4 text-gray-700"
          style={{ fontFamily: "Bambino" }}
        >
          {title}
        </h3>
        <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  // Add total sum to each data point for percentage calculation
  const totalSum = chartData.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = chartData.map((item) => ({ ...item, totalSum }));

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h3
        className="text-xs md:text-lg font-semibold mb-4 text-gray-700"
        style={{ fontFamily: "Bambino" }}
      >
        {title}
      </h3>
      <div className="w-full max-w-[180px] sm:max-w-[220px] min-h-[220px] sm:min-h-[250px] aspect-square">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              innerRadius="55%"
              dataKey="value"
              paddingAngle={3}
            >
              {dataWithTotal.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={60}
              iconType="circle"
              formatter={(value) => (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "black",
                    fontFamily: "Bambino",
                  }}
                >
                  {value?.toUpperCase()}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

  );
};

// Main component that uses the generic chart

export default DistributionPieCharts;

// Usage examples:
// Single chart: <DistributionPieChart data={paymentData} title="Payment Types" colors={myColors} />
// Multiple charts: <DistributionPieCharts reportData={reportData} />
