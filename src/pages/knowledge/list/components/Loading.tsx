
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';

const Loading = () => (
  <Flex align="center" gap="middle">
    <Spin indicator={<LoadingOutlined spin />} />
  </Flex>
);
export default Loading;