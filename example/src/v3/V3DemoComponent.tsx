import React from 'react';
import { Animated, Dimensions, ListRenderItem, View } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

import { FlatList } from 'react-native-gesture-handler';

type Props = {
  headerHeight?: number;
  tabBarHeight?: number;
};

const windowWidth = Dimensions.get('window').width;

const innerRenderItem0: ListRenderItem<number> = ({ index }) => {
  return (
    <View
      style={{
        backgroundColor: index % 2 === 0 ? '#E5E8E8' : '#FBFCFC',
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
        backgroundColor: index % 2 === 0 ? '#FBFCFC' : '#E5E8E8',
        height: 300,
        width: '100%',
      }}
    />
  );
};

const HEADER_HEIGHT = 250;
const TABBAR_HEIGHT = 48;

const flatListRef0 = React.createRef<FlatList<number>>();
const flatListRef1 = React.createRef<FlatList<number>>();
const flatListRef2 = React.createRef<FlatList<number>>();

const flatListRefs = [flatListRef0, flatListRef1, flatListRef2];

const V3Demo: React.FC<Props> = ({
  headerHeight = HEADER_HEIGHT,
  tabBarHeight = TABBAR_HEIGHT,
}) => {
  const [animatedValueX] = React.useState(new Animated.Value(0));
  const [animatedValuesY] = React.useState(
    flatListRefs.map(() => new Animated.Value(0))
  );

  const index = React.useRef(0);
  const lastScrollY = React.useRef(flatListRefs.map(() => 0));

  const [inputRangeX] = React.useState(
    [...Array(flatListRefs.length)].map((_v, i) => 0 + i * windowWidth)
  );

  const [translateYFromVerticalScroll] = React.useState(
    animatedValuesY[index.current].interpolate({
      inputRange: [0, Math.max(headerHeight, 0)],
      outputRange: [0, -headerHeight],
      extrapolateRight: 'clamp',
    })
  );

  const [translateYFromHorizontal] = React.useState(
    Animated.diffClamp(
      animatedValueX,
      0,
      windowWidth * flatListRefs.length
    ).interpolate({
      inputRange: inputRangeX,
      outputRange: [...Array(flatListRefs.length)].map((_v) => 0),
    })
  );

  const [translateY, setTranslateY] = React.useState(
    Animated.add(translateYFromVerticalScroll, translateYFromHorizontal)
  );

  const calculateTranslateYFromHorizontalScroll = useDebouncedCallback(
    () => {
      const focusedTabOffset = Math.min(
        lastScrollY.current[index.current],
        headerHeight
      );

      const newOutputRangeX = [...Array(flatListRefs.length)].map((_v, i) => {
        const tabOffset = Math.min(lastScrollY.current[i], headerHeight);
        const deltaOffset = focusedTabOffset - tabOffset;
        const computedOffset =
          deltaOffset > 0 ? Math.max(deltaOffset, 0) : Math.min(deltaOffset, 0);

        return i === index.current ? 0 : Math.min(computedOffset, headerHeight);
      });

      setTranslateY(
        Animated.add(
          animatedValuesY[index.current].interpolate({
            inputRange: [0, Math.max(headerHeight, 0)],
            outputRange: [0, -headerHeight],
            extrapolateRight: 'clamp',
          }),
          Animated.diffClamp(
            animatedValueX,
            0,
            windowWidth * flatListRefs.length
          ).interpolate({
            inputRange: inputRangeX,
            outputRange: newOutputRangeX,
          })
        )
      );
    },
    16,
    { trailing: true, leading: false }
  );

  React.useEffect(() => {
    animatedValueX.addListener(({ value }) => {
      index.current = Math.round(value / windowWidth);
      calculateTranslateYFromHorizontalScroll.callback();
    });

    animatedValuesY.forEach((v) =>
      v.addListener(({ value }) => {
        lastScrollY.current[index.current] = value;
      })
    );

    return () => {
      animatedValuesY.forEach((v) => v.removeAllListeners());
      animatedValueX.removeAllListeners();
    };
  }, [
    animatedValuesY,
    calculateTranslateYFromHorizontalScroll,
    animatedValueX,
  ]);

  // todo
  // const snap = useDebouncedCallback(
  //   (value) => {
  //     const nHeadersHeight = Math.floor(value / headerHeight);
  //     const delta = value - nHeadersHeight * headerHeight;
  //     if (delta <= headerHeight / 2) {
  //       Animated.spring(animatedValue, {
  //         toValue: 0,
  //         useNativeDriver: true,
  //       }).start(() => {
  //         // animatedValueDelta.setValue(-delta);

  //       });
  //       // flatListRefs[index.current].current?.scrollToOffset({
  //       //   offset: nHeadersHeight * headerHeight,
  //       //   animated: true,
  //       // });
  //       headerIsCollapsed.current = false;
  //     } else if (!headerIsCollapsed.current && delta < headerHeight) {
  //       animatedValueDelta.setValue(delta);
  //       Animated.spring(animatedValue, {
  //         toValue: headerHeight,
  //         useNativeDriver: true,
  //       }).start();
  //       if (value < headerHeight) {
  //         flatListRefs[index.current].current?.scrollToOffset({
  //           offset: headerHeight,
  //           animated: true,
  //         });
  //       }
  //       headerIsCollapsed.current = true;
  //     }
  //   },
  //   16,
  //   { trailing: true, leading: false }
  // );

  const onMomentumScrollEnd = React.useCallback(() => {
    // snap.callback()
    calculateTranslateYFromHorizontalScroll.callback();
  }, [calculateTranslateYFromHorizontalScroll]);

  // const onScrollBeginDrag

  const renderItem: ListRenderItem<number> = React.useCallback(
    ({ index }) => {
      return (
        <Animated.FlatList
          ref={flatListRefs[index]}
          bounces={false}
          bouncesZoom={false}
          style={{ width: windowWidth }}
          data={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
          keyExtractor={(item) => item + ''}
          renderItem={index % 2 === 0 ? innerRenderItem0 : innerRenderItem1}
          // contentOffset={{ y: headerHeight || 0, x: 0 }}
          contentContainerStyle={{
            paddingTop: headerHeight + tabBarHeight || 0,
            backgroundColor: 'black',
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: animatedValuesY[index] } } }],
            {
              useNativeDriver: true,
            }
          )}
          onMomentumScrollEnd={onMomentumScrollEnd}
          // onScrollBeginDrag={onScrollBeginDrag}
        />
      );
    },
    [animatedValuesY, headerHeight, onMomentumScrollEnd, tabBarHeight]
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          position: 'absolute',
          zIndex: 1,
          width: '100%',
          transform: [
            {
              translateY,
            },
          ],
        }}
      >
        <View style={{ height: HEADER_HEIGHT, backgroundColor: '#E74C3C' }} />
        <View style={{ height: TABBAR_HEIGHT, backgroundColor: '#F5B7B1' }} />
      </Animated.View>
      <Animated.FlatList
        data={[0, 1, 2]}
        keyExtractor={(item) => item + ''}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: animatedValueX } } }],
          {
            useNativeDriver: true,
          }
        )}
      />
    </View>
  );
};

export default V3Demo;
