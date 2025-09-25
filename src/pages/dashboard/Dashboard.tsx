import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardBody, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'

interface ShipmentData {
  month: number
  domestic: number
  export: number
  import: number
}

interface YearlyData {
  [year: number]: ShipmentData[]
}

const Dashboard: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)

  // Mock data for demonstration
  const mockData: YearlyData = {
    2024: [
      { month: 1, domestic: 150, export: 80, import: 120 },
      { month: 2, domestic: 170, export: 95, import: 135 },
      { month: 3, domestic: 160, export: 110, import: 140 },
      { month: 4, domestic: 180, export: 125, import: 145 },
      { month: 5, domestic: 200, export: 140, import: 160 },
      { month: 6, domestic: 190, export: 130, import: 155 },
      { month: 7, domestic: 210, export: 150, import: 170 },
      { month: 8, domestic: 220, export: 160, import: 180 },
      { month: 9, domestic: 195, export: 145, import: 165 },
      { month: 10, domestic: 185, export: 135, import: 150 },
      { month: 11, domestic: 175, export: 120, import: 140 },
      { month: 12, domestic: 165, export: 110, import: 130 }
    ],
    2023: [
      { month: 1, domestic: 130, export: 70, import: 100 },
      { month: 2, domestic: 140, export: 85, import: 115 },
      { month: 3, domestic: 145, export: 90, import: 125 },
      { month: 4, domestic: 155, export: 100, import: 130 },
      { month: 5, domestic: 165, export: 115, import: 140 },
      { month: 6, domestic: 160, export: 110, import: 135 },
      { month: 7, domestic: 170, export: 125, import: 145 },
      { month: 8, domestic: 180, export: 135, import: 155 },
      { month: 9, domestic: 175, export: 130, import: 150 },
      { month: 10, domestic: 165, export: 120, import: 140 },
      { month: 11, domestic: 155, export: 105, import: 125 },
      { month: 12, domestic: 145, export: 95, import: 115 }
    ]
  }

  const availableYears = Object.keys(mockData).map(Number).sort((a, b) => b - a)

  // Calculate yearly totals and percentages
  const yearlyStats = useMemo(() => {
    const yearData = mockData[selectedYear] || []
    const totals = yearData.reduce(
      (acc, month) => ({
        domestic: acc.domestic + month.domestic,
        export: acc.export + month.export,
        import: acc.import + month.import
      }),
      { domestic: 0, export: 0, import: 0 }
    )

    const total = totals.domestic + totals.export + totals.import
    const percentages = {
      domestic: total > 0 ? (totals.domestic / total) * 100 : 0,
      export: total > 0 ? (totals.export / total) * 100 : 0,
      import: total > 0 ? (totals.import / total) * 100 : 0
    }

    return { totals, percentages }
  }, [selectedYear, mockData])

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  // Calculate max value for chart scaling
  const maxValue = useMemo(() => {
    const yearData = mockData[selectedYear] || []
    return Math.max(
      ...yearData.flatMap(month => [month.domestic, month.export, month.import])
    )
  }, [selectedYear, mockData])

  // SVG Circle Chart Component
  const CircleChart: React.FC<{ percentage: number; color: string; label: string; value: number }> = ({
    percentage, color, label, value
  }) => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <svg width="100" height="100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
          <div className="text-sm font-medium">{value.toLocaleString()}</div>
        </div>
      </div>
    )
  }

  // SVG Line Chart Component
  const LineChart: React.FC = () => {
    const yearData = mockData[selectedYear] || []
    const chartWidth = 800
    const chartHeight = 300
    const padding = 40

    // const createPath = (data: number[], color: string) => {
    const createPath = (data: number[]) => {
      if (data.length === 0) return ''

      const points = data.map((value, index) => {
        const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1)
        const y = chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding))
        return `${x},${y}`
      }).join(' L ')

      return `M ${points}`
    }

    const domesticData = yearData.map(d => d.domestic)
    const exportData = yearData.map(d => d.export)
    const importData = yearData.map(d => d.import)

    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="w-full">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i * (chartHeight - 2 * padding)) / 4
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            )
          })}

          {/* X-axis labels */}
          {yearData.map((_, index) => {
            const x = padding + (index * (chartWidth - 2 * padding)) / (yearData.length - 1)
            return (
              <text
                key={index}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {monthNames[index]}
              </text>
            )
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = (maxValue * (4 - i)) / 4
            const y = padding + (i * (chartHeight - 2 * padding)) / 4
            return (
              <text
                key={i}
                x={30}
                y={y + 4}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {Math.round(value)}
              </text>
            )
          })}

          {/* Lines */}
          <path
            d={createPath(domesticData)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={createPath(exportData)}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={createPath(importData)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {yearData.map((data, index) => {
            const x = padding + (index * (chartWidth - 2 * padding)) / (yearData.length - 1)
            const domesticY = chartHeight - padding - ((data.domestic / maxValue) * (chartHeight - 2 * padding))
            const exportY = chartHeight - padding - ((data.export / maxValue) * (chartHeight - 2 * padding))
            const importY = chartHeight - padding - ((data.import / maxValue) * (chartHeight - 2 * padding))

            return (
              <g key={index}>
                <circle cx={x} cy={domesticY} r="4" fill="#3b82f6" />
                <circle cx={x} cy={exportY} r="4" fill="#10b981" />
                <circle cx={x} cy={importY} r="4" fill="#f59e0b" />
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Shipment Dashboard</h1>
        <Select
          label="Select Year"
          selectedKeys={[selectedYear.toString()]}
          className="w-40"
          onSelectionChange={(keys) => {
            const year = parseInt(Array.from(keys)[0] as string)
            setSelectedYear(year)
          }}
        >
          {availableYears.map((year) => (
            <SelectItem key={year.toString()} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Circle Charts */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon icon="solar:pie-chart-bold" className="text-blue-500" />
            Shipment Distribution for {selectedYear}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="flex justify-around items-center py-4">
            <CircleChart
              percentage={yearlyStats.percentages.domestic}
              color="#3b82f6"
              label="Domestic"
              value={yearlyStats.totals.domestic}
            />
            <CircleChart
              percentage={yearlyStats.percentages.export}
              color="#10b981"
              label="Export"
              value={yearlyStats.totals.export}
            />
            <CircleChart
              percentage={yearlyStats.percentages.import}
              color="#f59e0b"
              label="Import"
              value={yearlyStats.totals.import}
            />
          </div>
        </CardBody>
      </Card>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Icon icon="solar:graph-up-bold" className="text-green-500" />
              Monthly Requests Trend for {selectedYear}
            </h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Domestic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Export</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Import</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <LineChart />
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">{yearlyStats.totals.domestic.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Domestic Shipments</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">{yearlyStats.totals.export.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Export Shipments</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{yearlyStats.totals.import.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Import Shipments</div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard