import React from 'react';
import {View,Text,StyleSheet,TouchableOpacity} from 'react-native';
import {COLORS} from '../../theme/colors';

export default class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return{hasError:true,error};}
  componentDidCatch(error,info){console.error('ErrorBoundary caught:',error,info);}
  render(){
    if(this.state.hasError){
      return(
        <View style={s.container}>
          <Text style={s.icon}>⚠️</Text>
          <Text style={s.title}>Something went wrong</Text>
          <Text style={s.msg}>{this.state.error?.message||'Unknown error'}</Text>
          <TouchableOpacity style={s.btn} onPress={()=>this.setState({hasError:false,error:null})}>
            <Text style={s.btnTxt}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
const s=StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg,alignItems:'center',justifyContent:'center',padding:32},
  icon:{fontSize:52,marginBottom:16},
  title:{fontSize:20,fontWeight:'800',color:COLORS.text,marginBottom:8},
  msg:{fontSize:13,color:COLORS.textMuted,textAlign:'center',lineHeight:22,marginBottom:24},
  btn:{backgroundColor:COLORS.accent,paddingHorizontal:28,paddingVertical:12,borderRadius:12},
  btnTxt:{color:'#fff',fontWeight:'700',fontSize:15},
});
