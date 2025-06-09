import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { ScrollableTabView, Tab } from 'rn-simple-scrollable-tab-component';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollableTabView tabBarContainerStyle={styles.tabBarContainer}>
        <Tab id="label1" label="Tab 1">
          <Text style={styles.tabContent}>Content for Tab 1</Text>
        </Tab>
        <Tab id="label2" label="Tab 2">
          <Text style={styles.tabContent}>Content for Tab 2</Text>
        </Tab>
        <Tab id="label3" label="Tab 3">
          <Text style={styles.tabContent}>Content for Tab 3</Text>
        </Tab>
      </ScrollableTabView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarContainer: {
    backgroundColor: 'blue',
  },
  tabContent: {
    color: 'white',
  },
});
