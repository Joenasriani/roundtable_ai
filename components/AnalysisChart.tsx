
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ExpertAnalysis } from '../types';

interface AnalysisChartProps {
  experts: ExpertAnalysis[];
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({ experts }) => {
  const data = experts.map(e => ({
    subject: e.field.split(' ')[0], // Shorten name
    claims: e.keyClaims.length,
    fullField: e.field
  }));

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-20">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Interdisciplinary Intensity Map</h3>
        <p className="text-slate-500 text-sm">Visualizing the depth of analysis across all 14 academic domains.</p>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Radar
              name="Expert Depth"
              dataKey="claims"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.1}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value, name, props) => [value, 'Key Claims Identified']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisChart;
