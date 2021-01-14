import React from 'react';
import V3DemoComponent from './V3DemoComponent';
import { ExampleComponentType } from '../types';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

const V3Example: ExampleComponentType = () => {
  return <V3DemoComponent _sceneWidth={windowWidth / 3} />;
};

V3Example.title = 'v3 - rework (WIP), example 1';
V3Example.backgroundColor = '#2196f3';
V3Example.appbarElevation = 0;

export default V3Example;
