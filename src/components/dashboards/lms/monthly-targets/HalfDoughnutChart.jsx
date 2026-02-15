import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { chartJsDefaultTooltip } from 'helpers/chartjs-utils';
import { useAppContext } from 'providers/AppProvider';

const HalfDoughnutChart = ({
  color = 'primary',
  target = 50,
  reached = 50
}) => {
  const { getThemeColor } = useAppContext();

  const options = {
    rotation: -90,
    circumference: '180',
    cutout: '80%',
    hover: { mode: null },
    plugins: {
      legend: {
        display: false
      },
      tooltip: chartJsDefaultTooltip(getThemeColor)
    }
  };

  const data = {
    labels: ['Reached', 'Remaining'],
    datasets: [
      {
        data: [reached, target - reached],
        backgroundColor: [getThemeColor(color), getThemeColor('gray-300')],
        borderColor: [getThemeColor(color), getThemeColor('gray-300')]
      }
    ]
  };
  return <Doughnut data={data} options={options} width="112" />;
};

export default HalfDoughnutChart;
