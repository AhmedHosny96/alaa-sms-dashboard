import React from 'react';
import { RadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  RadarChart,
  CanvasRenderer,
  LegendComponent
]);

const tooltipFormatter = params => {
  return `<strong > ${params.name} </strong>
  <div class="fs-10 text-600">
    <strong >Marketing</strong>: ${params.value[0]}  <br>
    <strong>Sales</strong>: ${params.value[1]}  <br>
    <strong>Dev</strong>: ${params.value[2]}  <br>
    <strong>Support</strong>: ${params.value[3]}  <br>
    <strong>Tech</strong>: ${params.value[4]}  <br>
    <strong>Admin</strong>: ${params.value[5]}  <br>
  </div>`;
};

const getOptions = getThemeColor => ({
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: tooltipFormatter
  },
  radar: {
    splitNumber: 7,
    radius: '75%',
    axisLine: {
      show: true,
      symbol: 'circle',
      symbolSize: [13, 13],
      lineStyle: {
        color: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.5,
          colorStops: [
            {
              offset: 0.7,
              color: getThemeColor('gray-100')
            },
            {
              offset: 1,
              color: getThemeColor('gray-400')
            }
          ]
        }
      }
    },
    splitArea: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-300')
      }
    },
    axisName: {
      color: getThemeColor('gray-600'),
      fontWeight: 500
    },
    indicator: [
      { name: 'Marketing', max: 70 },
      { name: 'Admin', max: 70 },
      { name: 'Tech', max: 70 },
      { name: 'Support', max: 70 },
      { name: 'Dev', max: 70 },
      { name: 'Sales', max: 70 }
    ]
  },
  series: [
    {
      name: 'Budget vs spending',
      type: 'radar',
      symbol: 'pin',
      data: [
        {
          value: [20, 50, 60, 50, 60, 60],
          name: 'Budget',
          itemStyle: {
            color: rgbaColor(getThemeColor('warning'), 0.5)
          },
          areaStyle: {
            color: rgbaColor(getThemeColor('warning'), 0.24)
          },
          symbol: 'circle',
          symbolSize: 8
        },
        {
          value: [40, 60, 30, 15, 60, 35],
          name: 'Spending',
          areaStyle: {
            color: rgbaColor(getThemeColor('primary'), 0.24)
          },
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: getThemeColor('primary')
          }
        }
      ]
    }
  ],
  grid: {
    top: 0,
    bottom: '100px'
  }
});

const SalesPosLocationChart = () => {
  const { getThemeColor } = useAppContext();
  return (
    <>
      <ReactEchart
        echarts={echarts}
        option={getOptions(getThemeColor)}
        style={{ height: '22rem' }}
      />
    </>
  );
};

export default SalesPosLocationChart;
