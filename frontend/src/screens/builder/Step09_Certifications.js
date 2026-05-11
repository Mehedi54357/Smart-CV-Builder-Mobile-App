import React,{useState} from 'react';
import {View,Text,StyleSheet,ScrollView,Modal,TouchableOpacity,KeyboardAvoidingView,Platform,Alert} from 'react-native';
import {useForm,Controller} from 'react-hook-form';
import {useDispatch,useSelector} from 'react-redux';
import {addCertification,removeCertification,nextStep,prevStep,saveDraftAll} from '../../redux/slices/builderSlice';
import {COLORS} from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import {StepHeader} from '../../components/common/StepIndicator';

const POPULAR=['Udemy','Coursera','Google','Meta','Microsoft','Oracle','AWS','LinkedIn Learning','edX','Khan Academy'];

export default function Step09_Certifications({navigation}){
  const dispatch=useDispatch();
  const certs=useSelector(s=>s.builder.certifications);
  const isSaving=useSelector(s=>s.builder.isSaving);
  const [modal,setModal]=useState(false);
  const {control,handleSubmit,reset,setValue,formState:{errors}}=useForm();

  const onAdd=(data)=>{dispatch(addCertification(data));reset();setModal(false);};
  const onDelete=(i)=>Alert.alert('Delete?','',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>dispatch(removeCertification(i))}]);

  return(
    <View style={{flex:1,backgroundColor:COLORS.bg}}>
      <StepHeader step={9} totalSteps={11}/>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topRow}>
          <Text style={s.secTitle}>{certs.length} Certification(s)</Text>
          <TouchableOpacity style={s.addBtn} onPress={()=>setModal(true)}><Text style={s.addBtnTxt}>+ Add</Text></TouchableOpacity>
        </View>
        {certs.length===0&&(
          <View style={s.empty}>
            <Text style={{fontSize:44,marginBottom:12}}>📜</Text>
            <Text style={s.emptyTitle}>No Certifications</Text>
            <Text style={s.emptySub}>Add online courses, professional certificates</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={()=>setModal(true)}><Text style={s.emptyBtnTxt}>+ Add Certification</Text></TouchableOpacity>
          </View>
        )}
        {certs.map((cert,i)=>(
          <View key={i} style={s.card}>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <View style={{flex:1}}>
                <View style={s.certBadge}><Text style={s.certBadgeTxt}>CERTIFICATE</Text></View>
                <Text style={s.cardTitle}>{cert.courseName}</Text>
                <Text style={s.cardSub}>{cert.institution}</Text>
                <Text style={s.cardMeta}>{cert.year}{cert.credentialId?' • ID: '+cert.credentialId:''}</Text>
              </View>
              <TouchableOpacity style={s.delBtn} onPress={()=>onDelete(i)}><Text>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={s.popBox}>
          <Text style={s.popTitle}>🎓 Popular Platforms</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:8}}>
            {POPULAR.map(p=>(
              <TouchableOpacity key={p} style={s.popPill} onPress={()=>{setValue('institution',p);setModal(true);}}>
                <Text style={s.popPillTxt}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={s.nav}>
        <Button title="← Back" variant="ghost" onPress={()=>{dispatch(prevStep());navigation.goBack();}} style={{flex:1}} disabled={isSaving}/>
        <Button title={isSaving?'Saving...':'Save Draft'} variant="secondary" onPress={async()=>{await dispatch(saveDraftAll());Alert.alert('Success','Draft saved successfully!');}} style={{flex:1}} disabled={isSaving}/>
        <Button title="Next →" onPress={async()=>{await dispatch(saveDraftAll());dispatch(nextStep());navigation.navigate('Step10');}} style={{flex:1}} disabled={isSaving}/>
      </View>
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:COLORS.bg}}>
          <View style={s.mHead}><Text style={s.mTitle}>Add Certification</Text><TouchableOpacity onPress={()=>setModal(false)}><Text style={{color:COLORS.textMuted,fontSize:26}}>✕</Text></TouchableOpacity></View>
          <ScrollView contentContainerStyle={{padding:20}}>
            <Controller name="courseName" control={control} rules={{required:'Course name required'}} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Course / Certificate Name" placeholder="React Native — The Complete Guide" required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.courseName?.message}/>
            )}/>
            <Controller name="institution" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Issuing Organization" placeholder="Udemy / Coursera / Google" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Controller name="year" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Year Completed" placeholder="2024" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad"/>
            )}/>
            <Controller name="credentialId" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Credential ID (Optional)" placeholder="UC-XXXXXXXXX" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Button title="Add Certification" onPress={handleSubmit(onAdd)}/>
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
  certBadge:{alignSelf:'flex-start',backgroundColor:COLORS.gold+'20',borderRadius:6,paddingHorizontal:8,paddingVertical:3,marginBottom:6},
  certBadgeTxt:{fontSize:9,fontWeight:'900',color:COLORS.gold,letterSpacing:1},
  cardTitle:{fontSize:14,fontWeight:'700',color:COLORS.text,marginBottom:2},
  cardSub:{fontSize:13,color:COLORS.accent,fontWeight:'600'},
  cardMeta:{fontSize:11,color:COLORS.textMuted,marginTop:2},
  delBtn:{width:32,height:32,borderRadius:8,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center'},
  popBox:{backgroundColor:COLORS.bgCard,borderRadius:14,padding:16,marginTop:8,borderWidth:1,borderColor:COLORS.border},
  popTitle:{fontSize:13,fontWeight:'700',color:COLORS.text},
  popPill:{backgroundColor:COLORS.surface,borderRadius:100,paddingHorizontal:12,paddingVertical:6,borderWidth:1,borderColor:COLORS.border},
  popPillTxt:{fontSize:12,color:COLORS.textDim},
  nav:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mTitle:{fontSize:18,fontWeight:'800',color:COLORS.text},
});
