import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PermissionGate } from './src/components/PermissionGate';
import { MainScreen } from './src/screens/MainScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <PermissionGate>
        <MainScreen />
      </PermissionGate>
    </SafeAreaProvider>
  );
}

export default App;
