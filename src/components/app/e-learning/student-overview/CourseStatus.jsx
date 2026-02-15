import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from 'react-bootstrap';
import { PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import Flex from 'components/common/Flex';
import SubtleBadge from 'components/common/SubtleBadge';
import FalconLink from 'components/common/FalconLink';
import FalconCardHeader from 'components/common/FalconCardHeader';
import { useAppContext } from 'providers/AppProvider';
import ReactEchart from 'components/common/ReactEchart';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  PieChart,
  CanvasRenderer,
  LegendComponent
]);

const data = [
  {
    value: 13,
    name: 'Completed'
  },
  {
    value: 20,
    name: 'On going'
  },
  {
    value: 10,
    name: 'Droped'
  },
  {
    value: 7,
    name: 'Refunded'
  }
];

const getOptions = getThemeColor => ({
  color: [
    getThemeColor('primary'),
    getThemeColor('info'),
    getThemeColor('warning'),
    getThemeColor('success')
  ],
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('gray-100'),
    borderColor: getThemeColor('gray-300'),
    textStyle: { color: getThemeColor('gray-1100') },
    borderWidth: 1,
    transitionDuration: 0,
    axisPointer: {
      type: 'none'
    },
    formatter: params =>
      `<strong>${params.data.name}:</strong> ${params.data.value}%`
  },
  legend: {
    show: false
  },
  series: [
    {
      type: 'pie',
      radius: '70%',
      itemStyle: {
        borderWidth: 2,
        borderColor: getThemeColor('gray-100')
      },
      label: {
        show: false
      },
      center: ['50%', '50%'],
      data
    }
  ]
});

const CourseStatus = ({ data }) => {
  const { getThemeColor } = useAppContext();
  return (
    <Card className="h-100 font-sans-serif">
      <FalconCardHeader
        light
        title="Course Status"
        titleTag="h6"
        className="py-2"
        endEl={<FalconLink title="Details" className="px-0 fw-medium" />}
      />
      <Card.Body className="p-0">
        <Flex direction="column" justifyContent="between">
          <ReactEchart
            echarts={echarts}
            option={getOptions(getThemeColor)}
            style={{ height: 300 }}
          />
          <ul className="list-unstyled mb-0">
            {data.map((item, index) => (
              <li
                key={item.id}
                className={index % 2 === 0 ? 'bg-body-tertiary' : ''}
              >
                <Flex
                  wrap="wrap"
                  alignItems="center"
                  justifyContent="between"
                  className="gap-2 fs-11 p-x1"
                >
                  <h6 className="mb-0">
                    <span className="fs-xxl-10 fs-lg-11">{item.title}</span>
                    <SubtleBadge bg={item.badge.type} pill className="ms-2">
                      {item.badge.icon && (
                        <FontAwesomeIcon
                          icon={item.badge.icon}
                          className="ms-1"
                        />
                      )}
                      {item.badge.content}
                    </SubtleBadge>
                  </h6>
                  <p className="text-600 mb-0">{item.courses} Courses</p>
                </Flex>
              </li>
            ))}
          </ul>
        </Flex>
      </Card.Body>
    </Card>
  );
};

export default CourseStatus;
