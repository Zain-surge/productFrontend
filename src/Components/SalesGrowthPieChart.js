import { PieChart, Pie, Cell } from "recharts";

const COLORS = ["#6CE5E8", "#41B8D5"]; // Main color + subtle gray for remainder

const SalesGrowthPieChart = ({ growthPercentage }) => {
  const percentage = Math.min(Math.max(growthPercentage, 0), 100); // Clamp 0-100
  const data = [
    { name: "Growth", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
          ))}
        </Pie>
      </PieChart>

      {/* Center Percentage Text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-black">
        {growthPercentage.toFixed(1)}%
      </div>
      <div className=" text-base font-semibold text-black text-center">
        {growthPercentage.toFixed(1)}% more than last week
      </div>
    </div>
  );
};

export default SalesGrowthPieChart;
