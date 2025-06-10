import debounce from 'lodash.debounce';
import get from 'lodash.get';
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

type ScrollableTabViewProps = {
  children: ReactElement<TabType> | ReactElement<TabType>[];
  tabBarIndicatorStyle?: object;
  tabBarActiveTextColor?: string;
  tabBarInactiveTextColor?: string;
  tabBarContainerStyle?: object;
  tabBarTextStyle?: object;
  lazy?: boolean;
  initialTabIndex?: number;
};

export default function ScrollableTabView({
  children,
  tabBarIndicatorStyle,
  tabBarActiveTextColor,
  tabBarInactiveTextColor,
  tabBarContainerStyle,
  tabBarTextStyle,
  lazy = true,
  initialTabIndex = 1,
}: ScrollableTabViewProps) {
  const tabs: { id: string; label: string; content: ReactNode }[] =
    React.Children.map(children, (child: ReactElement<TabType>, index) => {
      const id = get(child, 'props.id', index.toString());
      const label = get(child, 'props.label', index.toString());
      const content = get(child, 'props.children', null);
      return {
        id,
        label,
        content,
      };
    });
  const initTab = initialTabIndex < tabs.length ? initialTabIndex : 0;
  const initId = get(tabs, '[' + initTab + '].id', 'Default');
  const [initialTab] = useState(initTab);
  const indicatorRef = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState(initId);
  const [screenWidth, setScreenWidth] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(new Set([initId]));
  const [shouldRender, setShouldRender] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleTabClick = useCallback(
    (tabId: string) => {
      const index = tabs.findIndex((tab) => tab.id === tabId);
      setSelectedTab(tabId);
      setVisitedTabs((prev) => new Set(prev).add(tabId));
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: index * screenWidth,
          y: 0,
          animated: true,
        });
      }
      Animated.spring(indicatorRef, {
        toValue: index * (screenWidth / tabs.length),
        useNativeDriver: true,
      }).start();
    },
    [tabs, screenWidth, indicatorRef]
  );

  const momentumScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (shouldRender) {
      const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
      if (index < tabs.length) {
        const tabId = get(tabs, '[' + index + '].id', 'Default');
        setSelectedTab(tabId);
        setVisitedTabs((prev) => new Set(prev).add(tabId));
      }
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(offsetX / screenWidth);
    const position = offsetX - index * screenWidth;
    indicatorRef.setValue((position + index * screenWidth) / tabs.length);
  };

  const handleInitialScroll = useCallback(
    (sW: number, iT: number) => {
      indicatorRef.setValue((iT * sW) / tabs.length);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: iT * sW,
          y: 0,
          animated: false,
        });
        setTimeout(() => setShouldRender(true), 50);
      }
    },
    [tabs, indicatorRef]
  );
  const debounceInitialFunction = useMemo(
    () => debounce(handleInitialScroll, 50),
    [handleInitialScroll]
  );

  const tabStyle = Object.assign({}, styles.tabBar, tabBarContainerStyle);
  const tabTextStyle = Object.assign({}, styles.tabText, tabBarTextStyle);
  const activeTabTextStyle = Object.assign(
    {},
    styles.activeTabText,
    tabBarTextStyle,
    { color: tabBarActiveTextColor }
  );
  const activeTab = Object.assign({}, styles.activeTab);
  const inactiveTab = Object.assign(
    {},
    styles.tabButton,
    tabBarInactiveTextColor
  );
  const indicatorStyle = Object.assign(
    {},
    styles.indicator,
    tabBarIndicatorStyle
  );
  //make the content lazy

  return (
    <View
      style={[styles.container]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setScreenWidth(width);
      }}
    >
      <View style={tabStyle}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[inactiveTab, selectedTab === tab.id && activeTab]}
            onPress={() => handleTabClick(tab.id)}
          >
            <Text
              style={selectedTab === tab.id ? activeTabTextStyle : tabTextStyle}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            indicatorStyle,
            {
              width: screenWidth / tabs.length,
              transform: [{ translateX: indicatorRef }],
            },
          ]}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;

          debounceInitialFunction(width, initialTab);
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={momentumScroll}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab, index) => {
          if (shouldRender && (!lazy || visitedTabs.has(tab.id))) {
            return (
              <View key={tab.id} style={[styles.tab, { width: screenWidth }]}>
                {tab.content}
              </View>
            );
          }
          return (
            <View key={index} style={[styles.tab, { width: screenWidth }]} />
          );
        })}
      </ScrollView>
    </View>
  );
}

export type TabType = (props: TabProps) => JSX.Element;
export type TabProps = { id: string; label: string; children: ReactNode };
export function Tab(_: TabProps) {
  return null; // purely structural
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabText: {
    color: '#555',
  },
  activeTab: {},
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  contentText: {
    fontSize: 16,
  },
  animatedContainer: {
    flexDirection: 'row',
    width: '100%', // accommodates 3 slides (adjust as needed)
  },
  indicator: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#007AFF',
    bottom: 0,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  tab: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
