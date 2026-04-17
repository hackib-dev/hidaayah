'use client';

import React from 'react';
import { UserMinus, TrendingUp, Package } from 'lucide-react';
import { HiUsers } from 'react-icons/hi2';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown, TrendingDown } from 'lucide-react';

interface LocationData {
  name: string;
  users: number;
  color: string;
}

interface InflowOutflowData {
  month: string;
  inflow: number;
  outflow: number;
}

interface TotalUsersData {
  month: string;
  percentage: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Overview: React.FC = () => {
  const metricsData = [
    {
      title: 'Completed KYC',
      value: 200,
      description: 'All users with completed KYC',
      percentageChange: 8.2,
      icon: HiUsers,
      variant: 'blue' as const
    },
    {
      title: 'Uncompleted KYC',
      value: 200,
      description: 'All users with uncompleted KYC',
      percentageChange: 8.2,
      icon: HiUsers,
      variant: 'red' as const
    },
    {
      title: 'Total User Pending',
      value: 200,
      description: 'All users pending verification',
      percentageChange: 8.2,
      icon: HiUsers,
      variant: 'orange' as const
    },
    {
      title: 'Inactive account',
      value: 200,
      percentageChange: -8.2,
      icon: UserMinus,
      variant: 'lightorange' as const
    },
    {
      title: 'Total Investment',
      value: '₦200,000,000',
      percentageChange: 8.2,
      icon: TrendingUp,
      variant: 'lightgreen' as const
    },
    {
      title: 'Total Products',
      value: 200,
      percentageChange: 8.2,
      icon: Package,
      variant: 'lightblue' as const
    }
  ];

  const locationData: LocationData[] = [
    { name: 'Lagos State', users: 12423, color: '#FFD93D' },
    { name: 'Kwara State', users: 9423, color: '#FF8C42' },
    { name: 'Ogun State', users: 6423, color: '#1E293B' },
    { name: 'Osun State', users: 3423, color: '#6366F1' }
  ];

  const inflowOutflowData: InflowOutflowData[] = [
    { month: 'April', inflow: 5000000, outflow: 2000000 },

    { month: 'May', inflow: 15000000, outflow: 8000000 },

    { month: 'June', inflow: 18000000, outflow: 10000000 }
  ];

  const totalUsersData: TotalUsersData[] = [
    { month: 'Jan', percentage: 8 },
    { month: 'Feb', percentage: 12 },
    { month: 'Mar', percentage: 25 },
    { month: 'Apr', percentage: 50 },
    { month: 'May', percentage: 35 },
    { month: 'Jun', percentage: 45 },
    { month: 'Jul', percentage: 55 },
    { month: 'Aug', percentage: 60 }
  ];

  const categoryData: CategoryData[] = [
    { name: 'Verified', value: 120, color: '#10B981' },
    { name: 'Not Verified', value: 80, color: '#F59E0B' }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border-[#E2E4E9] border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-gray-900">Users by Distribution</h2>
            <div className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
              <span>By Location</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="flex items-center justify-center mb-3">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {locationData.map((location, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: location.color }}
                ></div>
                <div>
                  <div className="text-xs text-gray-600">{location.name}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {location.users.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 border-[#E2E4E9] border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-medium text-gray-900">Total Inflow & Outflow</h2>
            <div className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
              <span>Months</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="mb-2">
            <div className="text-xs text-gray-500 mb-1">06.05.2025</div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Inflow</span>
                </div>
                <span className="text-sm font-medium">₦ 4,500,000</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-xs text-gray-600">Outflow</span>
                </div>
                <span className="text-sm font-medium">₦ 1,400,000</span>
              </div>
            </div>
          </div>

          <div className="h-48 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inflowOutflowData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stackId="2"
                  stroke="#F97316"
                  fill="#F97316"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">₦20,000,000</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-red-500 text-xs">
                <TrendingDown className="w-3 h-3" />
                <span>-1.5%</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>Inflow</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  <span>Outflow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
