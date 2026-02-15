import React from 'react';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { tooltipFormatter } from 'helpers/echart-utils';
import { getDates, rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent
]);

const dates = month => {
  return getDates(
    dayjs().month(month).date(1),
    dayjs()
      .month(Number(month) + 1)
      .date(0),
    1000 * 60 * 60 * 24 * 3
  );
};

const getOptions = (getThemeColor, newData, returningData, month) => ({
  title: {
    text: 'Customers',
    left: 'left',
    top: 'top',
    textStyle: {
      fontWeight: 500,
      fontSize: 13,
      fontFamily: 'poppins',
      color: getThemeColor('gray-900')
    }
  },
  legend: {
    show: false,
    data: ['New', 'Returning']
  },

  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-100'),
    color: getThemeColor('gray-1100'),
    borderWidth: 1,
    formatter: tooltipFormatter
  },
  xAxis: {
    type: 'category',
    data: dates(month),
    boundaryGap: false,
    axisPointer: {
      lineStyle: {
        color: getThemeColor('gray-300')
      }
    },
    axisLine: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'solid'
      }
    },
    axisTick: { show: false },
    axisLabel: {
      color: getThemeColor('gray-400'),
      formatter(value, index) {
        if (index === 0) {
          return `${dayjs(value).format('MMM DD')}`;
        }
        return `${dayjs(value).format('DD')}`;
      },
      margin: 15
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    }
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-300')
      }
    },
    axisLabel: {
      color: getThemeColor('gray-400'),
      margin: 15
    }
  },
  series: [
    {
      name: 'New',
      type: 'line',
      data: newData,
      lineStyle: { color: getThemeColor('primary') },
      itemStyle: {
        borderColor: getThemeColor('primary'),
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: rgbaColor(getThemeColor('primary'), 0.2)
            },
            {
              offset: 1,
              color: rgbaColor(getThemeColor('primary'), 0.01)
            }
          ]
        }
      },
      symbol: 'none',
      emphasis: {
        scale: true
      }
    },
    {
      name: 'Returning',
      type: 'line',
      data: returningData,
      lineStyle: { color: getThemeColor('warning') },
      itemStyle: {
        borderColor: getThemeColor('warning'),
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: rgbaColor(getThemeColor('warning'), 0.2)
            },
            {
              offset: 1,
              color: rgbaColor(getThemeColor('warning'), 0.01)
            }
          ]
        }
      },
      symbol: 'none',
      emphasis: {
        scale: true
      }
    }
  ],

  grid: {
    right: -2,
    left: -3,
    bottom: 5,
    top: 43,
    outerBoundsMode: 'same',
    outerBoundsContain: 'axisLabel'
  }
});

const ReturningCustomerChart = ({ newData, returningData, month, ref }) => {
  const { getThemeColor } = useAppContext();
  return (
    <>
      <ReactEchart
        ref={ref}
        echarts={echarts}
        option={getOptions(getThemeColor, newData, returningData, month)}
        style={{ height: '20rem' }}
      />
    </>
  );
};

export default ReturningCustomerChart;
