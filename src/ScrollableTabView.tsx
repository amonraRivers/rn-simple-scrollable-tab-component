import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';

type ScrollableTabViewProps = {
  children: React.ReactNode;
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
  const tabs = React.Children.toArray(children).map(child => ({
    id: child.props.id,
    label: child.props.label,
    content: child.props.children,
  }));
  const initTab = initialTabIndex < tabs.length ? initialTabIndex : 0;
  const [initialTab, setInitialTab] = useState(initTab);
  const indicatorRef = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState(tabs[initTab].id);
  const [screenWidth, setScreenWidth] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(new Set([tabs[initTab].id]));
  const [shouldRender, setShouldRender] = useState(false)
  const scrollRef = useRef(null);

  useEffect(() => {
    const index = tabs.findIndex(tab => tab.id === selectedTab);
    if (screenWidth > 0) {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: index * screenWidth,
          y: 0,
          animated: true,
        });
      }
      setVisitedTabs(prev => new Set(prev).add(tabs[index].id));
      Animated.spring(indicatorRef, {
        toValue: index * (screenWidth / tabs.length),
        useNativeDriver: true,
      }).start();
    }
  }, [selectedTab, screenWidth, initialTab, scrollRef.current]);

  const momentumScroll = event => {
    console.log('momentumscrollend');
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setSelectedTab(tabs[index]?.id);
  };

  const handleScroll = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(offsetX / screenWidth);
    const position = offsetX - index * screenWidth;
    indicatorRef.setValue((position + index * screenWidth) / tabs.length);
  };

  const handleInitialScroll = useCallback(() => {
    indicatorRef.setValue((initialTab * screenWidth) / tabs.length);
      scrollRef.current.scrollTo({
        x: initialTab * screenWidth,
        y: 0,
        animated: false,
      });
    const t=setTimeout(()=>setShouldRender(true),200)
  }, [screenWidth, initialTab]);

  const tabStyle = Object.assign({}, styles.tabBar, tabBarContainerStyle);
  const tabTextStyle = Object.assign({}, styles.tabText, tabBarTextStyle);
  const activeTabTextStyle = Object.assign(
    {},
    styles.activeTabText,
    tabBarTextStyle,
    { color: tabBarActiveTextColor },
  );
  const activeTab = Object.assign({}, styles.activeTab);
  const inactiveTab = Object.assign(
    {},
    styles.tabButton,
    tabBarInactiveTextColor,
  );
  const indicatorStyle = Object.assign(
    {},
    styles.indicator,
    tabBarIndicatorStyle,
  );
  //make the content lazy

  return (
    <View
      style={[styles.container]}
      onLayout={event => {
        const { width } = event.nativeEvent.layout;
        setScreenWidth(width);
        indicatorRef.setValue(initialTab * (width / tabs.length));
      }}>
      <View style={tabStyle}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[inactiveTab, selectedTab === tab.id && activeTab]}
            onPress={() => setSelectedTab(tab.id)}>
            <Text
              style={
                selectedTab === tab.id ? activeTabTextStyle : tabTextStyle
              }>
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
        onLayout={handleInitialScroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={momentumScroll}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollContainer}>
        {tabs.map((tab, index) => {
          if (shouldRender && (!lazy || visitedTabs.has(tab.id))) {
            console.log('should of loaded');
            return (
              <View key={tab.id} style={{ width: screenWidth, flex: 1 }}>
                {tab.content}
              </View>
            );
          }
          return (
            <View
              key={index}
              style={{ backgroundColor: 'transparent', flex: 1, width: screenWidth }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

export function Tab({ id, label, children }) {
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
    padding: 20,
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
});
