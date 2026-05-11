import React,{useState} from 'react';
import {View,Text,StyleSheet,ScrollView,Modal,TouchableOpacity,KeyboardAvoidingView,Platform} from 'react-native';
import {useForm,Controller} from 'react-hook-form';
import {useDispatch,useSelector} from 'react-redux';
import {addReference,nextStep,prevStep,saveDraftAll} from '../../redux/slices/builderSlice';
import {Alert} from 'react-native';
import {generateCV} from '../../redux/slices/cvSlice';
import {COLORS} from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import {StepHeader} from '../../components/common/StepIndicator';

export default function Step11_References({navigation}){
  const dispatch=useDispatch();
  const references=useSelector(s=>s.builder.references);
  const {isGenerating}=useSelector(s=>s.cv);
  const selectedTemplate=useSelector(s=>s.builder.selectedTemplate);
  const [modal,setModal]=useState(false);
  const {control,handleSubmit,reset,formState:{errors}}=useForm();

  const onAdd=(data)=>{dispatch(addReference(data));reset();setModal(false);};
  const onGenerate=async()=>{
    try {
      await dispatch(saveDraftAll());
      navigation.navigate('Preview');
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred while saving your draft.');
    }
  };

  return(
    <View style={{flex:1,backgroundColor:COLORS.bg}}>
      <StepHeader step={11} totalSteps={11}/>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topRow}>
          <Text style={s.secTitle}>{references.length} Reference(s)</Text>
          <TouchableOpacity style={s.addBtn} onPress={()=>setModal(true)} disabled={references.length>=2}><Text style={[s.addBtnTxt,references.length>=2&&{opacity:0.4}]}>+ Add</Text></TouchableOpacity>
        </View>
        {references.length===0&&(
          <View style={s.empty}>
            <Text style={{fontSize:44,marginBottom:12}}>👤</Text>
            <Text style={s.emptyTitle}>No References Yet</Text>
            <Text style={s.emptySub}>Add 1-2 professional references (optional but recommended for Govt jobs)</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={()=>setModal(true)}><Text style={s.emptyBtnTxt}>+ Add Reference</Text></TouchableOpacity>
          </View>
        )}
        {references.map((ref,i)=>(
          <View key={i} style={s.card}>
            <View style={{flexDirection:'row',gap:12}}>
              <View style={s.refAvatar}><Text style={s.refAvatarTxt}>{ref.name?.[0]||'R'}</Text></View>
              <View style={{flex:1}}>
                <Text style={s.refName}>{ref.name}</Text>
                <Text style={s.refDesig}>{ref.designation}</Text>
                <Text style={s.refOrg}>{ref.organization}</Text>
                <View style={{flexDirection:'row',gap:12,marginTop:4}}>
                  {ref.phone?<Text style={s.refContact}>📞 {ref.phone}</Text>:null}
                  {ref.email?<Text style={s.refContact}>✉ {ref.email}</Text>:null}
                </View>
              </View>
            </View>
          </View>
        ))}
        <View style={s.finishBox}>
          <Text style={s.finishIcon}>🎉</Text>
          <Text style={s.finishTitle}>All Done!</Text>
          <Text style={s.finishSub}>Your CV is ready to generate. Click the button below to create your professional PDF and Word CV.</Text>
          <View style={s.progressRow}>
            {[1,2,3,4,5,6,7,8,9,10,11].map(n=>(
              <View key={n} style={[s.progressDot,{backgroundColor:COLORS.emerald}]}/>
            ))}
          </View>
          <Text style={s.progressTxt}>11/11 Steps Complete ✅</Text>
        </View>
      </ScrollView>
      <View style={s.nav}>
        <Button title="← Back" variant="ghost" onPress={()=>{dispatch(prevStep());navigation.goBack();}} style={{flex:1}}/>
        <Button title="Save Draft" variant="secondary" onPress={async()=>{await dispatch(saveDraftAll());Alert.alert('Success','Draft saved successfully!');}} style={{flex:1}}/>
        <Button title={isGenerating?'Generating...':'🎉 Generate CV'} onPress={onGenerate} loading={isGenerating} style={{flex:2,backgroundColor:COLORS.emerald}}/>
      </View>
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:COLORS.bg}}>
          <View style={s.mHead}><Text style={s.mTitle}>Add Reference</Text><TouchableOpacity onPress={()=>setModal(false)}><Text style={{color:COLORS.textMuted,fontSize:26}}>✕</Text></TouchableOpacity></View>
          <ScrollView contentContainerStyle={{padding:20}}>
            <Controller name="name" control={control} rules={{required:'Name required'}} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Full Name" placeholder="Dr. Mohammed Ali" required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message}/>
            )}/>
            <Controller name="designation" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Designation / Title" placeholder="Professor / Senior Manager" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Controller name="organization" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Organization" placeholder="BUET / Company Name" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Controller name="phone" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Phone Number" placeholder="01XXXXXXXXX" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="phone-pad"/>
            )}/>
            <Controller name="email" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Email Address" placeholder="reference@example.com" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="email-address"/>
            )}/>
            <Controller name="relation" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Relationship" placeholder="Former Supervisor / Academic Advisor" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Button title="Add Reference" onPress={handleSubmit(onAdd)}/>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
const s=StyleSheet.create({
  content:{padding:16,paddingBottom:20},
  topRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},
  secTitle:{fontSize:16,fontWeight:'800',color:COLORS.text},
  addBtn:{backgroundColor:COLORS.accentSoft,paddingHorizontal:14,paddingVertical:8,borderRadius:8,borderWidth:1,borderColor:COLORS.borderActive},
  addBtnTxt:{color:COLORS.accent,fontWeight:'700',fontSize:13},
  empty:{alignItems:'center',padding:40,backgroundColor:COLORS.bgCard,borderRadius:14,borderWidth:1,borderColor:COLORS.border,borderStyle:'dashed'},
  emptyTitle:{fontSize:16,fontWeight:'700',color:COLORS.text,marginBottom:4},
  emptySub:{fontSize:13,color:COLORS.textMuted,textAlign:'center',marginBottom:20},
  emptyBtn:{backgroundColor:COLORS.accent,paddingHorizontal:24,paddingVertical:10,borderRadius:10},
  emptyBtnTxt:{color:COLORS.white,fontWeight:'700',fontSize:14},
  card:{backgroundColor:COLORS.bgCard,borderRadius:14,padding:16,marginBottom:12,borderWidth:1,borderColor:COLORS.border},
  refAvatar:{width:48,height:48,borderRadius:24,backgroundColor:COLORS.accentSoft,borderWidth:2,borderColor:COLORS.borderActive,alignItems:'center',justifyContent:'center'},
  refAvatarTxt:{fontSize:20,fontWeight:'900',color:COLORS.accent},
  refName:{fontSize:15,fontWeight:'800',color:COLORS.text},
  refDesig:{fontSize:13,color:COLORS.accent,fontWeight:'600',marginTop:1},
  refOrg:{fontSize:13,color:COLORS.textDim,marginTop:1},
  refContact:{fontSize:11,color:COLORS.textMuted},
  finishBox:{backgroundColor:'#0D2B1F',borderRadius:16,padding:24,alignItems:'center',marginTop:8,borderWidth:1,borderColor:COLORS.emerald+'40'},
  finishIcon:{fontSize:44,marginBottom:8},
  finishTitle:{fontSize:22,fontWeight:'900',color:COLORS.white,marginBottom:8},
  finishSub:{fontSize:13,color:'#6EE7B7',textAlign:'center',lineHeight:22,marginBottom:16},
  progressRow:{flexDirection:'row',gap:6,marginBottom:8},
  progressDot:{width:16,height:6,borderRadius:3},
  progressTxt:{fontSize:13,color:COLORS.emerald,fontWeight:'700'},
  nav:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mTitle:{fontSize:18,fontWeight:'800',color:COLORS.text},
});
