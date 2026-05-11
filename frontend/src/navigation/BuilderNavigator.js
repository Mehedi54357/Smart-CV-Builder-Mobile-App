import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Step01_Personal from '../screens/builder/Step01_Personal';
import Step02_Contact from '../screens/builder/Step02_Contact';
import Step03_Objective from '../screens/builder/Step03_Objective';
import Step04_Education from '../screens/builder/Step04_Education';
import Step05_Experience from '../screens/builder/Step05_Experience';
import Step06_Projects from '../screens/builder/Step06_Projects';
import Step07_Skills from '../screens/builder/Step07_Skills';
import Step08_Languages from '../screens/builder/Step08_Languages';
import Step09_Certifications from '../screens/builder/Step09_Certifications';
import Step10_Achievements from '../screens/builder/Step10_Achievements';
import Step11_References from '../screens/builder/Step11_References';

const Stack = createStackNavigator();

export default function BuilderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Step01" component={Step01_Personal} />
      <Stack.Screen name="Step02" component={Step02_Contact} />
      <Stack.Screen name="Step03" component={Step03_Objective} />
      <Stack.Screen name="Step04" component={Step04_Education} />
      <Stack.Screen name="Step05" component={Step05_Experience} />
      <Stack.Screen name="Step06" component={Step06_Projects} />
      <Stack.Screen name="Step07" component={Step07_Skills} />
      <Stack.Screen name="Step08" component={Step08_Languages} />
      <Stack.Screen name="Step09" component={Step09_Certifications} />
      <Stack.Screen name="Step10" component={Step10_Achievements} />
      <Stack.Screen name="Step11" component={Step11_References} />
    </Stack.Navigator>
  );
}
