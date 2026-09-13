import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// Screens
import AuthScreen from '@/screens/Auth';
import VenturesListScreen from '@/screens/VenturesList';
import VentureDetailScreen from '@/screens/VentureDetail';
import PathStageScreen from '@/screens/PathStage';
import GuideScreen from '@/screens/Guide';
import SettingsScreen from '@/screens/Settings';

export type RootStackParamList = {
  Auth: undefined;
  MainApp: undefined;
};

export type MainAppStackParamList = {
  Ventures: undefined;
  VentureDetail: { id: string };
  PathStage: { ventureId: string; stageId: string };
  Guide: { ventureId?: string };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainAppStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['app://', 'https://arclaunch.net'],
  config: {
    screens: {
      Auth: 'signin',
      MainApp: {
        screens: {
          Ventures: 'ventures',
          VentureDetail: 'ventures/:id',
          PathStage: 'venture/:ventureId/stage/:stageId',
          Guide: 'guide',
          Settings: 'settings',
        },
      },
    },
  },
};

function MainAppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0066cc',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Ventures"
        component={VenturesListScreen}
        options={{
          title: 'Ventures',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Guide"
        component={GuideScreen}
        options={{
          title: 'AI Guide',
          tabBarLabel: 'Guide',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Group
            screenOptions={{
              animationEnabled: false,
            }}
          >
            <Stack.Screen name="Auth" component={AuthScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="MainApp"
              component={MainAppNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
              }}
            >
              <Stack.Screen
                name="VentureDetail"
                component={VentureDetailScreen}
              />
              <Stack.Screen name="PathStage" component={PathStageScreen} />
            </Stack.Group>
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
