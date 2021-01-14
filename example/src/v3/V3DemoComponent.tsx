import React from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  ListRenderItem,
  View,
} from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

import { ScrollView, FlatList } from 'react-native-gesture-handler';

type Props = {
  headerHeight?: number;
  /**
   * will be removed, just for demo purpose
   */
  _sceneWidth?: number;
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

const HEADER_HEIGHT = 250;

const scrollRef = React.createRef<ScrollView>();
const flatListRef0 = React.createRef<FlatList<number>>();
const flatListRef1 = React.createRef<FlatList<number>>();
const flatListRef2 = React.createRef<FlatList<number>>();

const flatListRefs = [flatListRef0, flatListRef1, flatListRef2];

const V3Demo: React.FC<Props> = ({
  headerHeight = HEADER_HEIGHT,
  _sceneWidth = windowWidth,
}) => {
  const lastScrollY = React.useRef<number>(0);
  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const [layoutHeight, setLayoutHeight] = React.useState<number | null>(null);

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  const snap = useDebouncedCallback(
    (value) => {
      if (value <= headerHeight / 2) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        flatListRefs.forEach((ref) => {
          ref.current?.scrollToOffset({ offset: 0, animated: true });
        });
      } else if (value < headerHeight) {
        scrollRef.current?.scrollTo({ y: headerHeight, animated: true });
        if (!scrollEnabled) {
          setScrollEnabled(true);
        }
      }
    },
    16,
    { trailing: true, leading: false }
  );

  const enableScroll = useDebouncedCallback(
    (value) => {
      if (value === 0 && scrollEnabled) {
        setScrollEnabled(false);
        flatListRefs.forEach((ref) => {
          ref.current?.scrollToOffset({ offset: 0, animated: true });
        });
      } else if (value >= headerHeight && !scrollEnabled) {
        setScrollEnabled(true);
      } else if (value <= headerHeight && scrollEnabled) {
        setScrollEnabled(false);
      }
    },
    16,
    { trailing: true, leading: false }
  );

  const onMomentumScrollEnd = React.useCallback(() => {
    enableScroll.callback(lastScrollY.current);
    snap.callback(lastScrollY.current);
  }, [enableScroll, snap]);

  const onScrollBeginDrag = React.useCallback(() => {
    snap.cancel();
    enableScroll.cancel();
  }, [enableScroll, snap]);

  const renderItem: ListRenderItem<number> = React.useCallback(
    ({ index }) => {
      return (
        <FlatList
          ref={flatListRefs[index]}
          style={{ width: _sceneWidth }}
          data={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
          keyExtractor={(item) => item + ''}
          renderItem={index % 2 === 0 ? innerRenderItem0 : innerRenderItem1}
          nestedScrollEnabled
          scrollEnabled={scrollEnabled}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollBeginDrag={onScrollBeginDrag}
        />
      );
    },
    [onMomentumScrollEnd, onScrollBeginDrag, scrollEnabled, _sceneWidth]
  );

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={
          layoutHeight === null
            ? { flex: 1 }
            : { height: layoutHeight + headerHeight }
        }
        stickyHeaderIndices={[1]}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={(event) => {
          lastScrollY.current = event.nativeEvent.contentOffset.y;
        }}
      >
        <View style={{ backgroundColor: 'red', height: 250, width: '100%' }} />
        <View style={{ backgroundColor: 'green', height: 48, width: '100%' }} />
        <FlatList
          data={[0, 1, 2]}
          keyExtractor={(item) => item + ''}
          renderItem={renderItem}
          horizontal
          pagingEnabled
        />
      </ScrollView>
    </View>
  );
};

export default V3Demo;
