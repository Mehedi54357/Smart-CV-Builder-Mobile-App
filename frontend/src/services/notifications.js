import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform} from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async()=>({shouldShowAlert:true,shouldPlaySound:true,shouldSetBadge:true}),
});

export const registerForPushNotifications=async()=>{
  if(!Device.isDevice) return null;
  const {status:existing}=await Notifications.getPermissionsAsync();
  let finalStatus=existing;
  if(existing!=='granted'){
    const {status}=await Notifications.requestPermissionsAsync();
    finalStatus=status;
  }
  if(finalStatus!=='granted') return null;
  if(Platform.OS==='android'){
    await Notifications.setNotificationChannelAsync('default',{
      name:'default',importance:Notifications.AndroidImportance.MAX,
      vibrationPattern:[0,250,250,250],lightColor:'#3B82F6',
    });
  }
  const token=(await Notifications.getExpoPushTokenAsync()).data;
  return token;
};

export const scheduleLocalNotification=async(title,body,seconds=1)=>{
  await Notifications.scheduleNotificationAsync({
    content:{title,body,sound:'default'},
    trigger:{seconds},
  });
};

export const sendCVReadyNotification=()=>scheduleLocalNotification(
  '🎉 CV Ready!','Your professional CV has been generated successfully.',1
);
export const sendDraftSavedNotification=()=>scheduleLocalNotification(
  '💾 Draft Saved','Your progress has been saved.',1
);
