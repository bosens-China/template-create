import React, { useState } from 'react';
import { Button, Typography, InputNumber, Space } from 'antd';
import { enlarge, reduce, reset } from '@store/list';
import type { RootState } from '@store/index';
import { useDispatch, useSelector } from 'react-redux';

const { Text } = Typography;

function List() {
  const [num, setNum] = useState(0);
  const count = useSelector((state: RootState) => state.list.value);
  const dispatch = useDispatch();
  const onChange = (value: number) => {
    setNum(value);
  };
  return (
    <Space>
      <Text>当前数为：{count}</Text>
      <Button onClick={() => dispatch(enlarge())}>增大</Button>
      <Button onClick={() => dispatch(reduce())}>减小</Button>

      <InputNumber value={num} onChange={onChange} />
      <Button onClick={() => dispatch(reset(num))}>重制</Button>
    </Space>
  );
}

export default List;
