import React from 'react';
import { BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { Card, Form } from 'react-bootstrap';
import FalconCardHeader from 'components/common/FalconCardHeader';
import { rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  LegendComponent,
  DatasetComponent
]);

const getOption = (getThemeColor, data) => ({
  color: [
    rgbaColor(getThemeColor('info'), 0.6),
    getThemeColor('primary'),
    rgbaColor(getThemeColor('warning'), 0.4)
  ],
  dataset: { source: data },
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: function (params) {
      return `<div className="fw-semibold">${params.seriesName
        }</div><div className="fs-10 text-600"><strong>${params.name}:</strong> ${params.value[params.componentIndex + 1]
        }</div>`;
    }
  },
  legend: {
    data: ['Free Course', 'Paid Course', 'On sale Course'],
    left: 'left',
    top: 'top',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 10,
    borderRadius: 0,
    icon: 'circle',
    inactiveColor: getThemeColor('gray-400'),
    textStyle: { color: getThemeColor('gray-700') }
  },
  xAxis: {
    type: 'category',
    axisLabel: { color: getThemeColor('gray-400') },
    axisLine: {
      lineStyle: {
        color: getThemeColor('gray-300'),
        type: 'line'
      }
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: getThemeColor('gray-200'),
        type: 'line',
        width: 0.5
      }
    },
    axisTick: { show: false },
    boundaryGap: true
  },
  yAxis: {
    axisPointer: { type: 'none' },
    axisTick: 'none',
    splitLine: {
      lineStyle: {
        color: getThemeColor('gray-200'),
        type: 'dashed'
      }
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      color: getThemeColor('gray-400'),
      formatter: value => `${Math.round((value / 1000) * 10) / 10}k`
    }
  },
  series: [
    {
      type: 'bar',
      barWidth: '15%',
      barGap: '30%',
      label: { show: false },
      z: 10,
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        borderRadius: [2, 2, 0, 0]
      }
    },
    {
      type: 'bar',
      barWidth: '15%',
      barGap: '30%',
      label: { show: false },
      z: 10,
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        borderRadius: [2, 2, 0, 0]
      }
    },
    {
      type: 'bar',
      barWidth: '15%',
      barGap: '30%',
      label: { show: false },
      z: 10,
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        borderRadius: [2, 2, 0, 0]
      }
    }
  ],
  grid: { right: '0', left: '30px', bottom: '10%', top: '20%' }
});

const CourseEnrollments = ({ data }) => {
  const { getThemeColor } = useAppContext();
  return (
    <Card className="h-100">
      <FalconCardHeader
        title="Course Enrollment"
        titleTag="h6"
        className="py-2"
        light
        endEl={
          <Form.Select size="sm">
            <option>Last 7 days</option>
            <option>Last Month</option>
            <option>Last Year</option>
          </Form.Select>
        }
      />
      <Card.Body className="h-100 w-100">
        <ReactEchart
          echarts={echarts}
          option={getOption(getThemeColor, data)}
          style={{ height: '100%', minHeight: '15.625rem' }}
        />
      </Card.Body>
    </Card>
  );
};

export default CourseEnrollments;
