import React from 'react';
import {
  Animated,
  Dimensions,
  ListRenderItem,
  ScrollView,
  View,
} from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

type Props = {
  headerHeight?: number;
};

const windowWidth = Dimensions.get('window').width;

const innerRenderItem0: ListRenderItem<number> = ({ index }) => {
  return (
    <View
      style={{
        backgroundColor: index % 2 === 0 ? 'blue' : 'yellow',
        height: 300,
        width: '100%',
      }}
    />
  );
};

const innerRenderItem1: ListRenderItem<number> = ({ index }) => {
  return (
    <View
      style={{
        backgroundColor: index % 2 === 0 ? 'purple' : 'black',
        height: 300,
        width: '100%',
      }}
    />
  );
};

const renderItem: ListRenderItem<number> = ({ index }) => {
  return (
    <Animated.FlatList
      style={{ width: windowWidth }}
      data={[0, 1, 2]}
      keyExtractor={(item) => item + ''}
      renderItem={index % 2 === 0 ? innerRenderItem0 : innerRenderItem1}
    />
  );
};

const HEADER_HEIGHT = 250;

const V3Demo: React.FC<Props> = ({ headerHeight = HEADER_HEIGHT }) => {
  const scrollY = React.useRef(new Animated.Value(0));
  const ref = React.useRef<ScrollView>();

  const snap = useDebouncedCallback(
    (value) => {
      if (value <= headerHeight / 2) {
        ref?.current?.scrollTo({ y: 0, animated: true });
      } else if (value > headerHeight / 2 && value < 250) {
        ref?.current?.scrollTo({ y: headerHeight, animated: true });
      }
    },
    16,
    { trailing: true, leading: false }
  );

  const lastScrollY = React.useRef<number>(0);

  React.useEffect(() => {
    scrollY.current.addListener(({ value }) => {
      lastScrollY.current = value;
    });

    return () => {
      scrollY.current.removeAllListeners();
    };
  }, [snap]);

  const onMomentumScrollEnd = React.useCallback(() => {
    snap.callback(lastScrollY.current);
  }, [snap]);

  const onScrollBeginDrag = React.useCallback(() => {
    snap.cancel();
  }, [snap]);

  return (
    <Animated.ScrollView
      ref={ref}
      contentContainerStyle={{ backgroundColor: 'red' }}
      nestedScrollEnabled
      stickyHeaderIndices={[1]}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollBeginDrag={onScrollBeginDrag}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
        {
          useNativeDriver: true,
        }
      )}
    >
      <View style={{ backgroundColor: 'red', height: 250, width: '100%' }} />
      <View style={{ backgroundColor: 'green', height: 48, width: '100%' }} />
      <Animated.FlatList
        data={[0, 1, 2]}
        keyExtractor={(item) => item + ''}
        renderItem={renderItem}
        horizontal
        pagingEnabled
      />
    </Animated.ScrollView>
  );
};

export default V3Demo;
