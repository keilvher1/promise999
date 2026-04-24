"use client"

import { turnoutHistory, seatChanges } from "@/lib/election-data"

function TurnoutChart() {
  const maxRate = Math.max(...turnoutHistory.map(d => d.rate))
  const minRate = Math.min(...turnoutHistory.map(d => d.rate))
  const range = maxRate - minRate

  // Calculate points for the line chart
  const width = 180
  const height = 80
  const padding = 10

  const points = turnoutHistory.map((d, i) => {
    const x = padding + (i / (turnoutHistory.length - 1)) * (width - padding * 2)
    const y = height - padding - ((d.rate - minRate) / range) * (height - padding * 2)
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <div className="mb-6">
      <h4 className="font-sans text-xs font-semibold text-gray-600 mb-2 tracking-tight">
        역대 투표율
      </h4>
      <svg
        viewBox={`0 0 ${width} ${height + 20}`}
        className="w-full h-auto"
        aria-label="역대 지방선거 투표율 추이"
        role="img"
      >
        {/* Grid lines */}
        {[0, 1, 2].map(i => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i / 2) * (height - padding * 2)}
            x2={width - padding}
            y2={padding + (i / 2) * (height - padding * 2)}
            stroke="#E5E5E5"
            strokeWidth="1"
          />
        ))}

        {/* Line path */}
        <path
          d={pathD}
          fill="none"
          stroke="#000000"
          strokeWidth="1.5"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="1.5"
            />
            <text
              x={p.x}
              y={height + 12}
              textAnchor="middle"
              className="fill-gray-500"
              style={{ fontSize: "8px" }}
            >
              {p.year}
            </text>
          </g>
        ))}

        {/* Latest rate label */}
        <text
          x={points[points.length - 1].x + 8}
          y={points[points.length - 1].y + 3}
          className="fill-black font-semibold"
          style={{ fontSize: "9px" }}
        >
          {turnoutHistory[turnoutHistory.length - 1].rate}%
        </text>
      </svg>
    </div>
  )
}

function SeatChangeChart() {
  const maxSeats = Math.max(...seatChanges.flatMap(d => [d.previous, d.current]))

  return (
    <div>
      <h4 className="font-sans text-xs font-semibold text-gray-600 mb-3 tracking-tight">
        주요 정당 의석 변화
      </h4>
      <div className="space-y-3">
        {seatChanges.map((party) => (
          <div key={party.party} className="text-xs">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-gray-600 truncate max-w-[100px]">
                {party.party}
              </span>
              <span className="text-gray-500">
                {party.previous} → {party.current}
              </span>
            </div>
            <div className="flex gap-1 items-center">
              {/* Previous bar */}
              <div
                className="h-2 bg-gray-300"
                style={{ width: `${(party.previous / maxSeats) * 100}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="flex gap-1 items-center mt-0.5">
              {/* Current bar */}
              <div
                className="h-2 bg-black"
                style={{ width: `${(party.current / maxSeats) * 100}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-gray-300" />
          <span>이전</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2 bg-black" />
          <span>현재</span>
        </div>
      </div>
    </div>
  )
}

export function SidePanel() {
  return (
    <aside
      className="hidden lg:block sticky top-8 w-56 flex-shrink-0"
      aria-label="선거 통계"
    >
      <div className="border border-gray-300 p-4 bg-white">
        <h3 className="font-sans font-semibold text-sm text-black mb-4 tracking-tight">
          이 선거 한눈에 보기
        </h3>
        <TurnoutChart />
        <SeatChangeChart />
      </div>
    </aside>
  )
}
