import * as React from 'react';
import V3DemoComponent from './V3DemoComponent';
import { ExampleComponentType } from '../types';

const V3Example: ExampleComponentType = () => {
  return <V3DemoComponent />;
};

V3Example.title = 'v3 - rework (WIP)';
V3Example.backgroundColor = '#2196f3';
V3Example.appbarElevation = 0;

export default V3Example;
