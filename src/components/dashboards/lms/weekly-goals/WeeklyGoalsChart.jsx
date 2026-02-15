import React, { useRef } from 'react';
import { GaugeChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  GaugeChart,
  CanvasRenderer,
  LegendComponent
]);

const getOptions = getThemeColor => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: getThemeColor('gray-100'),
    textStyle: { color: getThemeColor('gray-1100') },
    formatter: params =>
      `<h6 class="mb-0">${params.seriesName}: ${params.value}%</h6>`
  },
  series: [
    {
      type: 'gauge',
      name: 'Site visit',
      startAngle: 90,
      endAngle: -270,
      radius: '85%',
      pointer: {
        show: false
      },
      center: ['50%', '50%'],
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: getThemeColor('info')
        }
      },
      axisLine: {
        lineStyle: {
          width: 8,
          color: [[1, getThemeColor('gray-200')]]
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      data: [79],
      detail: {
        show: false
      },
      animationDuration: 2000
    },
    {
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      radius: '70%',
      name: 'Support',
      pointer: {
        show: false
      },
      center: ['50%', '50%'],
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: getThemeColor('primary')
        }
      },
      axisLine: {
        lineStyle: {
          width: 8,
          color: [[1, getThemeColor('gray-200')]]
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      data: [85],
      detail: {
        show: false
      },
      animationDuration: 2000
    },
    {
      type: 'gauge',
      name: 'Revenue',
      startAngle: 90,
      endAngle: -270,
      radius: '55%',
      pointer: {
        show: false
      },
      center: ['50%', '50%'],
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: getThemeColor('success')
        }
      },
      axisLine: {
        lineStyle: {
          width: 8,
          color: [[1, getThemeColor('gray-200')]]
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      data: [70],
      detail: {
        show: false
      },
      animationDuration: 2000
    }
  ]
});

const WeeklyGoalsChart = () => {
  const { getThemeColor } = useAppContext();
  const chartRef = useRef(null);
  return (
    <ReactEchart
      ref={chartRef}
      echarts={echarts}
      option={getOptions(getThemeColor)}
      style={{ height: '15.625rem' }}
    />
  );
};

export default WeeklyGoalsChart;
