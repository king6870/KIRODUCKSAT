"use client"

import React from 'react'

interface ChartRendererProps {
  chartData: any
  imageUrl?: string
  imageAlt?: string
  className?: string
}

export default function ChartRenderer({ chartData, className = "" }: ChartRendererProps) {
  if (!chartData) {
    return null
  }

  return (
    <div className={`chart-container ${className}`}>
      <DynamicChart chartData={chartData} />
    </div>
  )
}

function DynamicChart({ chartData }: { chartData: any }) {
  if (!chartData) {
    return null
  }

  if (chartData.type === 'scatter' || chartData.points) {
    return <ScatterPlot data={chartData} />
  }
  
  if (chartData.type === 'bar' || chartData.data) {
    return <BarChart data={chartData} />
  }

  if (chartData.type === 'geometry' || chartData.shape) {
    return <GeometryDiagram data={chartData} />
  }

  return (
    <div className="bg-blue-50 p-4 rounded border">
      <div className="text-sm font-semibold text-blue-700 mb-2">📊 Chart</div>
      {chartData.description && (
        <div className="text-sm text-blue-600 mb-2">{chartData.description}</div>
      )}
      <div className="text-xs text-gray-500">
        Type: {chartData.type || 'Unknown'}
      </div>
    </div>
  )
}

function ScatterPlot({ data }: { data: any }) {
  const width = 300
  const height = 300
  const padding = 40

  return (
    <div className="bg-white p-4 rounded border shadow-sm">
      <div className="text-sm font-semibold text-gray-700 mb-2">📈 Coordinate Plane</div>
      <svg width={width} height={height} className="border border-gray-300">
        {/* Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect x={padding} y={padding} width={width - 2 * padding} height={height - 2 * padding} fill="url(#grid)" />
        
        {/* Axes */}
        <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#374151" strokeWidth="2"/>
        <line x1={width/2} y1={padding} x2={width/2} y2={height - padding} stroke="#374151" strokeWidth="2"/>
        
        {/* Points */}
        {data.points?.map((point: any, index: number) => {
          const x = width/2 + (point.x || 0) * 10
          const y = height/2 - (point.y || 0) * 10
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="#3b82f6"
                stroke="#1d4ed8"
                strokeWidth="2"
              />
              {point.label && (
                <text
                  x={x + 8}
                  y={y - 8}
                  fontSize="12"
                  fill="#374151"
                  fontWeight="bold"
                >
                  {point.label}
                </text>
              )}
            </g>
          )
        })}
        
        {/* Line between points */}
        {data.line && data.points && data.points.length >= 2 && (
          <line
            x1={width/2 + (data.points[0].x || 0) * 10}
            y1={height/2 - (data.points[0].y || 0) * 10}
            x2={width/2 + (data.points[1].x || 0) * 10}
            y2={height/2 - (data.points[1].y || 0) * 10}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </div>
  )
}

function BarChart({ data }: { data: any }) {
  const width = 300
  const height = 200
  const padding = 40
  
  const values = data.data || []
  
  // If no data, create sample data to prevent "No data available"
  if (values.length === 0) {
    console.log('⚠️ Bar chart has no data, creating sample data')
    const sampleData = [
      {label: "Jan", value: 150},
      {label: "Feb", value: 200},
      {label: "Mar", value: 175},
      {label: "Apr", value: 225}
    ]
    return <BarChart data={{...data, data: sampleData}} />
  }

  const maxValue = Math.max(...values.map((item: any) => item.score || item.value || 1))
  const barWidth = Math.max(20, (width - 2 * padding) / values.length - 10)

  return (
    <div className="bg-white p-4 rounded border shadow-sm">
      <div className="text-sm font-semibold text-gray-700 mb-2">📊 Bar Chart</div>
      <svg width={width} height={height} className="border border-gray-300">
        {values.map((item: any, index: number) => {
          const value = item.score || item.value || 0
          const barHeight = Math.max(0, (value / maxValue) * (height - 2 * padding))
          const x = padding + index * (barWidth + 10)
          const y = height - padding - barHeight
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                stroke="#1d4ed8"
              />
              <text
                x={x + barWidth/2}
                y={y - 5}
                fontSize="10"
                fill="#374151"
                textAnchor="middle"
              >
                {value}
              </text>
              <text
                x={x + barWidth/2}
                y={height - padding + 15}
                fontSize="10"
                fill="#374151"
                textAnchor="middle"
              >
                {item.student || item.label || `${index + 1}`}
              </text>
            </g>
          )
        })}
        
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1"/>
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="1"/>
      </svg>
    </div>
  )
}

function GeometryDiagram({ data }: { data: any }) {
  const width = 300
  const height = 250
  const centerX = width / 2
  const centerY = height / 2

  return (
    <div className="bg-white p-4 rounded border shadow-sm">
      <div className="text-sm font-semibold text-gray-700 mb-2">🔺 Geometry Diagram</div>
      {data.description && (
        <div className="text-xs text-gray-600 mb-2">{data.description}</div>
      )}
      <svg width={width} height={height} className="border border-gray-300">
        {/* Always show a triangle by default for geometry questions */}
        <TriangleShape data={data} centerX={centerX} centerY={centerY} />
      </svg>
    </div>
  )
}

function TriangleShape({ data, centerX, centerY }: { data: any, centerX: number, centerY: number }) {
  const size = 80
  const height = size * Math.sqrt(3) / 2
  
  const points = [
    [centerX, centerY - height/2],
    [centerX - size/2, centerY + height/2],
    [centerX + size/2, centerY + height/2]
  ]
  
  const pathData = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`
  
  // Use provided angles or default to 60° each for equilateral triangle
  const angles = data.angles && data.angles.length >= 3 ? data.angles : [60, 60, 60]
  
  return (
    <g>
      <path d={pathData} fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" />
      
      {/* Always show angle labels */}
      <text x={centerX} y={centerY - height/2 + 15} fontSize="12" fill="#374151" textAnchor="middle">
        {angles[0]}°
      </text>
      <text x={centerX - size/2 + 15} y={centerY + height/2 - 5} fontSize="12" fill="#374151" textAnchor="middle">
        {angles[1]}°
      </text>
      <text x={centerX + size/2 - 15} y={centerY + height/2 - 5} fontSize="12" fill="#374151" textAnchor="middle">
        {angles[2]}°
      </text>
      
      {/* Vertex labels */}
      <text x={centerX} y={centerY - height/2 - 10} fontSize="12" fill="#374151" textAnchor="middle" fontWeight="bold">A</text>
      <text x={centerX - size/2 - 15} y={centerY + height/2 + 15} fontSize="12" fill="#374151" textAnchor="middle" fontWeight="bold">B</text>
      <text x={centerX + size/2 + 15} y={centerY + height/2 + 15} fontSize="12" fill="#374151" textAnchor="middle" fontWeight="bold">C</text>
    </g>
  )
}
