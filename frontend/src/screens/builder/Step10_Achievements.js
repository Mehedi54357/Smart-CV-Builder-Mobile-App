import React,{useState} from 'react';
import {View,Text,StyleSheet,ScrollView,Modal,TouchableOpacity,KeyboardAvoidingView,Platform,Alert} from 'react-native';
import {useForm,Controller} from 'react-hook-form';
import {useDispatch,useSelector} from 'react-redux';
import {addAchievement,nextStep,prevStep,saveDraftAll} from '../../redux/slices/builderSlice';
import {COLORS} from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import {StepHeader} from '../../components/common/StepIndicator';

const TYPES=[{id:'scholarship',label:'Scholarship',icon:'🎓',color:COLORS.gold},{id:'award',label:'Award',icon:'🏆',color:COLORS.accent},{id:'competition',label:'Competition',icon:'🥇',color:COLORS.emerald},{id:'publication',label:'Publication',icon:'📰',color:COLORS.violet},{id:'volunteer',label:'Volunteer',icon:'🤝',color:'#06B6D4'},{id:'other',label:'Other',icon:'⭐',color:COLORS.textMuted}];

export default function Step10_Achievements({navigation}){
  const dispatch=useDispatch();
  const achievements=useSelector(s=>s.builder.achievements);
  const isSaving=useSelector(s=>s.builder.isSaving);
  const [modal,setModal]=useState(false);
  const [type,setType]=useState(TYPES[0]);
  const {control,handleSubmit,reset,formState:{errors}}=useForm();

  const onAdd=(data)=>{dispatch(addAchievement({...data,type:type.id,typeLabel:type.label,icon:type.icon,color:type.color}));reset();setModal(false);};

  return(
    <View style={{flex:1,backgroundColor:COLORS.bg}}>
      <StepHeader step={10} totalSteps={11}/>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topRow}>
          <Text style={s.secTitle}>{achievements.length} Achievement(s)</Text>
          <TouchableOpacity style={s.addBtn} onPress={()=>setModal(true)}><Text style={s.addBtnTxt}>+ Add</Text></TouchableOpacity>
        </View>
        {achievements.length===0&&(
          <View style={s.empty}>
            <Text style={{fontSize:44,marginBottom:12}}>🏆</Text>
            <Text style={s.emptyTitle}>No Achievements Yet</Text>
            <Text style={s.emptySub}>Add scholarships, awards, competitions, publications</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={()=>setModal(true)}><Text style={s.emptyBtnTxt}>+ Add Achievement</Text></TouchableOpacity>
          </View>
        )}
        {achievements.map((a,i)=>(
          <View key={i} style={[s.card,{borderLeftColor:a.color||COLORS.gold}]}>
            <View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
              <View style={[s.achIcon,{backgroundColor:(a.color||COLORS.gold)+'20'}]}>
                <Text style={{fontSize:20}}>{a.icon||'⭐'}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={s.achType}>{a.typeLabel||a.type}</Text>
                <Text style={s.cardTitle}>{a.title}</Text>
                {a.organization?<Text style={s.cardSub}>{a.organization}</Text>:null}
                {a.year?<Text style={s.cardMeta}>{a.year}</Text>:null}
                {a.description?<Text style={s.cardDesc}>{a.description}</Text>:null}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={s.nav}>
        <Button title="← Back" variant="ghost" onPress={()=>{dispatch(prevStep());navigation.goBack();}} style={{flex:1}} disabled={isSaving}/>
        <Button title={isSaving?'Saving...':'Save Draft'} variant="secondary" onPress={async()=>{await dispatch(saveDraftAll());Alert.alert('Success','Draft saved successfully!');}} style={{flex:1}} disabled={isSaving}/>
        <Button title="Next →" onPress={async()=>{await dispatch(saveDraftAll());dispatch(nextStep());navigation.navigate('Step11');}} style={{flex:1}} disabled={isSaving}/>
      </View>
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:COLORS.bg}}>
          <View style={s.mHead}><Text style={s.mTitle}>Add Achievement</Text><TouchableOpacity onPress={()=>setModal(false)}><Text style={{color:COLORS.textMuted,fontSize:26}}>✕</Text></TouchableOpacity></View>
          <ScrollView contentContainerStyle={{padding:20}}>
            <Text style={s.fieldLabel}>Category</Text>
            <View style={s.typeGrid}>
              {TYPES.map(t=>(
                <TouchableOpacity key={t.id} onPress={()=>setType(t)} style={[s.typeCard,type.id===t.id&&{borderColor:t.color,backgroundColor:t.color+'15'}]}>
                  <Text style={{fontSize:20,marginBottom:4}}>{t.icon}</Text>
                  <Text style={[s.typeTxt,type.id===t.id&&{color:t.color,fontWeight:'700'}]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Controller name="title" control={control} rules={{required:'Title required'}} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Achievement Title" placeholder="National Merit Scholarship 2023" required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message}/>
            )}/>
            <Controller name="organization" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Issuing Organization" placeholder="Ministry of Education / University" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Controller name="year" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Year" placeholder="2023" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="number-pad"/>
            )}/>
            <Controller name="description" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Description (Optional)" placeholder="Brief description of this achievement..." value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={3}/>
            )}/>
            <Button title="Add Achievement" onPress={handleSubmit(onAdd)}/>
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
  card:{backgroundColor:COLORS.bgCard,borderRadius:14,padding:16,marginBottom:12,borderWidth:1,borderColor:COLORS.border,borderLeftWidth:4},
  achIcon:{width:44,height:44,borderRadius:10,alignItems:'center',justifyContent:'center'},
  achType:{fontSize:10,fontWeight:'900',textTransform:'uppercase',letterSpacing:1,color:COLORS.textMuted,marginBottom:4},
  cardTitle:{fontSize:14,fontWeight:'700',color:COLORS.text,marginBottom:2},
  cardSub:{fontSize:13,color:COLORS.accent,fontWeight:'600'},
  cardMeta:{fontSize:11,color:COLORS.textMuted,marginTop:2},
  cardDesc:{fontSize:12,color:COLORS.textDim,marginTop:6,lineHeight:18},
  nav:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mTitle:{fontSize:18,fontWeight:'800',color:COLORS.text},
  fieldLabel:{fontSize:11,fontWeight:'700',color:COLORS.textDim,textTransform:'uppercase',letterSpacing:0.8,marginBottom:10},
  typeGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:20},
  typeCard:{width:'30%',backgroundColor:COLORS.surface,borderRadius:10,padding:10,alignItems:'center',borderWidth:1,borderColor:COLORS.border},
  typeTxt:{fontSize:11,color:COLORS.textMuted,textAlign:'center'},
});
