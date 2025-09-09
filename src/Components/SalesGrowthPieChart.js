import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#6CE5E8", "#41B8D5"]; // Main color + subtle gray for remainder

const SalesGrowthPieChart = ({ growthPercentage, period = "weekly2" }) => {
  const percentage = Math.min(Math.max(growthPercentage, 0), 100); // Clamp 0-100

  const data = [
    { name: "Growth", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  // Text logic
  const isPositive = growthPercentage >= 0;
  const directionText = isPositive ? "more" : "less";

  let periodText = "last week";
  if (period === "daily2" || period==='today') periodText = "yesterday";
  if (period === "monthly2") periodText = "last month";
  if (period === "weekly2") periodText = "last week";

  return (
    <div className="relative w-full max-w-[180px] sm:max-w-[220px] aspect-square mx-auto">
      <h3
        className="text-xs md:text-lg font-semibold mb-4 text-gray-700"
        style={{ fontFamily: "Bambino" }}
      >
        Sales Growth
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="75%"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm sm:text-lg font-semibold text-black text-center">
        £{growthPercentage > 0 ? "+" : ""}
        {growthPercentage.toFixed(1)}
      </div>

      {/* Comparison Text */}
      <div className="text-xs sm:text-sm font-semibold text-black text-center mt-2">
        £{Math.abs(growthPercentage).toFixed(1)} {directionText} than {periodText}
      </div>
    </div>
  );
};

export default SalesGrowthPieChart;
