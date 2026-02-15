import React from 'react';
import { chartJsDefaultTooltip } from 'helpers/chartjs-utils';
import { Doughnut } from 'react-chartjs-2';
import { useAppContext } from 'providers/AppProvider';

const ProductShareChart = () => {
  const { getThemeColor } = useAppContext();

  const options = {
    tooltip: chartJsDefaultTooltip(getThemeColor),
    rotation: -90,
    circumference: '180',
    cutout: '80%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: chartJsDefaultTooltip(getThemeColor)
    }
  };

  const data = {
    labels: ['Falcon', 'Sparrow'],
    datasets: [
      {
        data: [50, 88],
        backgroundColor: [getThemeColor('primary'), getThemeColor('gray-300')],
        borderColor: [getThemeColor('primary'), getThemeColor('gray-300')]
      }
    ]
  };
  return <Doughnut data={data} options={options} width="112" />;
};

export default ProductShareChart;
