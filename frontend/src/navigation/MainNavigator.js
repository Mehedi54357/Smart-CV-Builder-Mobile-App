import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { COLORS } from '../theme/colors';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TemplateSelectScreen from '../screens/templates/TemplateSelectScreen';
import DocumentVaultScreen from '../screens/documents/DocumentVaultScreen';
import CVPreviewScreen from '../screens/preview/CVPreviewScreen';
import BuilderNavigator from './BuilderNavigator';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ name, focused }) => {
  const icons = {
    Dashboard: '⊞', Builder: '✎', Templates: '⊡', Documents: '⊟', Preview: '◉',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color: focused ? COLORS.accent : COLORS.textMuted }}>
        {icons[name] || '●'}
      </Text>
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          paddingBottom: 8, paddingTop: 8, height: 64,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Builder" component={BuilderNavigator} />
      <Tab.Screen name="Templates" component={TemplateSelectScreen} />
      <Tab.Screen name="Documents" component={DocumentVaultScreen} />
      <Tab.Screen name="Preview" component={CVPreviewScreen} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
