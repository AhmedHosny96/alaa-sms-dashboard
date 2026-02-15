import React from 'react';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  LegendComponent
]);

const tooltipFormatter = params => {
  return params
    .map(
      ({ value, seriesName, borderColor }) =>
        `<div class="dot me-1 fs-11 d-inline-block" style="background-color: ${borderColor}"></div>
              <span class='text-600'>${seriesName}: ${value}</span>`
    )
    .join('<br/>');
};

const getOptions = (getThemeColor, data) => ({
  color: getThemeColor('gray-100'),
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-100'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    formatter: tooltipFormatter,
    transitionDuration: 0
  },
  legend: {
    data: ['onSaleCourse', 'regularPaidCourse'],
    show: false
  },
  xAxis: [
    {
      type: 'category',
      position: 'bottom',
      data: [
        'launch',
        'week 1',
        'week 2',
        'week 3',
        'week 4',
        'week 5',
        'week 6',
        'week 7',
        'week 8',
        'week 9',
        'week 10',
        'week 11',
        'week 12'
      ],
      boundaryGap: 0,
      axisPointer: {
        lineStyle: {
          color: getThemeColor('gray-200'),
          type: 'line'
        }
      },
      splitLine: { show: false },
      axisLine: {
        lineStyle: {
          color: getThemeColor('gray-200'),
          type: 'line'
        }
      },

      axisTick: { show: false },
      axisLabel: {
        color: getThemeColor('gray-500'),
        formatter(value) {
          return value;
        },
        interval: 3,
        margin: 15,
        showMinLabel: true,
        showMaxLabel: false,
        align: 'center'
      }
    },
    {
      type: 'category',
      position: 'bottom',
      data: [
        'launch',
        'week 1',
        'week 2',
        'week 3',
        'week 4',
        'week 5',
        'week 6',
        'week 7',
        'week 8',
        'week 9',
        'week 10',
        'week 11',
        'week 12'
      ],
      boundaryGap: 0,
      axisPointer: {
        lineStyle: {
          color: getThemeColor('gray-200'),
          type: 'line'
        }
      },
      splitLine: { show: false },
      axisLine: {
        lineStyle: {
          color: getThemeColor('gray-200'),
          type: 'line'
        }
      },

      axisTick: { show: false },
      axisLabel: {
        color: getThemeColor('gray-500'),
        formatter(value) {
          return value;
        },
        interval: 200,
        margin: 15,
        showMaxLabel: true,
        showMinLabel: false,
        align: 'right'
      }
    }
  ],
  yAxis: {
    type: 'value',
    splitNumber: 3,
    axisPointer: { show: false },
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-200'),
        type: 'line'
      }
    },
    boundaryGap: 0,
    axisLabel: {
      showMinLabel: false,
      show: true,
      color: getThemeColor('gray-400'),
      margin: 15,
      formatter: value => `${Math.round((value / 1000) * 10) / 10}k`
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [
    {
      name: 'On Sale Course',
      type: 'line',
      data: data.onSaleCourse,
      lineStyle: { color: getThemeColor('primary') },
      itemStyle: {
        borderColor: getThemeColor('primary'),
        borderWidth: 2
      },
      symbol: 'circle',
      symbolSize: 10,
      emphasis: {
        scale: true
      }
    },
    {
      name: 'Regular Paid Course',
      type: 'line',
      data: data.regularPaidCourse,
      lineStyle: { color: getThemeColor('warning'), type: 'dashed' },
      itemStyle: {
        borderColor: getThemeColor('warning'),
        borderWidth: 2
      },
      symbol: 'circle',
      symbolSize: 10,
      emphasis: {
        scale: true
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
              color: rgbaColor(getThemeColor('warning'), 0)
            }
          ]
        }
      }
    }
  ],
  grid: {
    right: 7,
    left: -1,
    bottom: '6%',
    top: 9,
    outerBoundsMode: 'same',
    outerBoundsContain: 'axisLabel'
  }
});

const AverageEnrollmentChart = ({ data, ref }) => {
  const { getThemeColor } = useAppContext();
  return (
    <ReactEchart
      ref={ref}
      echarts={echarts}
      option={getOptions(getThemeColor, data)}
    />
  );
};

export default AverageEnrollmentChart;
