import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#475569', boxWidth: 12, font: { size: 11 } },
    },
  },
}

export default function PieChart({ data, options, className = 'h-64' }) {
  return (
    <div className={className}>
      <Pie data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  )
}
