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
import { getPastDates, rgbaColor } from 'helpers/utils';
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
      ({ value, borderColor }, index) =>
        `<div class="dot me-1 fs-11 d-inline-block" style="background-color: ${borderColor}"></div>
              <span class='text-600'>${index === 0 ? 'This Week' : 'Last Week'
        }: ${value} SMS</span>`
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
    data: ['lastMonth', 'previousYear'],
    show: false
  },
  xAxis: {
    type: 'category',
    data:
      Array.isArray(data?.labels) && data.labels.length
        ? data.labels
        : getPastDates(Math.max(7, (data?.lastMonth || []).length || 12)),
    boundaryGap: 0,
    axisPointer: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    },
    splitLine: { show: false },
    axisLine: {
      lineStyle: {
        color: rgbaColor('#000', 0.01),
        type: 'dashed'
      }
    },
    axisTick: { show: false },
    axisLabel: {
      color: getThemeColor('gray-400'),
      margin: 15,
      // Backend labels (e.g. "Mon 4 May") are already formatted; only date strings
      // need the dayjs format pass.
      formatter: value => {
        if (!value || /[A-Za-z]/.test(value)) return value;
        const d = dayjs(value);
        return d.isValid() ? d.format('MMM DD') : value;
      }
    }
  },
  yAxis: {
    type: 'value',
    axisPointer: { show: false },
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'dashed'
      }
    },
    boundaryGap: 0,
    axisLabel: {
      show: true,
      color: getThemeColor('gray-400'),
      margin: 15
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [
    {
      name: 'lastMonth',
      type: 'line',
      data: data.lastMonth,
      lineStyle: { color: getThemeColor('primary') },
      itemStyle: {
        borderColor: getThemeColor('primary'),
        borderWidth: 2,
        backgroundColor: 'transparent'
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
              color: rgbaColor(getThemeColor('primary'), 0.2)
            },
            {
              offset: 1,
              color: rgbaColor(getThemeColor('primary'), 0)
            }
          ]
        }
      }
    },
    {
      name: 'previousYear',
      type: 'line',
      data: data.previousYear,
      lineStyle: { color: rgbaColor(getThemeColor('warning'), 0.3) },
      itemStyle: {
        borderColor: rgbaColor(getThemeColor('warning'), 0.6),
        borderWidth: 2
      },
      symbol: 'circle',
      symbolSize: 10,
      emphasis: {
        scale: true
      }
    }
  ],
  grid: { right: '18px', left: '40px', bottom: '15%', top: '5%', outerBoundsMode: 'none' }
});

const TotalSalesChart = ({ data, ref }) => {
  const { getThemeColor } = useAppContext();
  return (
    <ReactEchart
      ref={ref}
      echarts={echarts}
      option={getOptions(getThemeColor, data)}
    />
  );
};

export default TotalSalesChart;
