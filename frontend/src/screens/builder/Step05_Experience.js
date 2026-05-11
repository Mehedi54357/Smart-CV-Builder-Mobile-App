import React,{useState} from 'react';
import {View,Text,StyleSheet,ScrollView,Modal,TouchableOpacity,Alert,KeyboardAvoidingView,Platform,Switch} from 'react-native';
import {useForm,Controller} from 'react-hook-form';
import {useDispatch,useSelector} from 'react-redux';
import {addExperience,updateExperience,removeExperience,nextStep,prevStep,saveDraftAll} from '../../redux/slices/builderSlice';
import {COLORS} from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import {StepHeader} from '../../components/common/StepIndicator';

const Card=({exp,onEdit,onDelete})=>(
  <View style={s.card}>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
      <View style={{flex:1}}>
        <Text style={s.cardTitle}>{exp.title}</Text>
        <Text style={s.cardSub}>{exp.company}</Text>
        <Text style={s.cardMeta}>{exp.fromDate} — {exp.isCurrent?'🟢 Present':exp.toDate}</Text>
      </View>
      <View style={{flexDirection:'row',gap:6}}>
        <TouchableOpacity style={s.iconBtn} onPress={()=>onEdit(exp)}><Text>✏️</Text></TouchableOpacity>
        <TouchableOpacity style={s.iconBtn} onPress={()=>onDelete(exp.id)}><Text>🗑️</Text></TouchableOpacity>
      </View>
    </View>
    {exp.description?<Text style={s.cardDesc} numberOfLines={2}>{exp.description}</Text>:null}
  </View>
);

export default function Step05_Experience({navigation}){
  const dispatch=useDispatch();
  const experiences=useSelector(s=>s.builder.experiences);
  const [modal,setModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [isCurrent,setIsCurrent]=useState(false);
  const {control,handleSubmit,reset,setValue,formState:{errors}}=useForm();

  const openAdd=()=>{setEditItem(null);setIsCurrent(false);reset({});setModal(true);};
  const openEdit=(exp)=>{setEditItem(exp);setIsCurrent(exp.isCurrent);setValue('company',exp.company);setValue('title',exp.title);setValue('fromDate',exp.fromDate);setValue('toDate',exp.toDate);setValue('description',exp.description);setModal(true);};
  const onSave=(data)=>{
    const payload={...data,isCurrent,toDate:isCurrent?'Present':data.toDate};
    editItem?dispatch(updateExperience({...payload,id:editItem.id})):dispatch(addExperience(payload));
    setModal(false);reset({});
  };
  const onDelete=(id)=>Alert.alert('Delete?','Remove this experience?',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>dispatch(removeExperience(id))}]);

  return(
    <View style={{flex:1,backgroundColor:COLORS.bg}}>
      <StepHeader step={5} totalSteps={11}/>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topRow}>
          <Text style={s.secTitle}>{experiences.length} Experience(s)</Text>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}><Text style={s.addBtnTxt}>+ Add</Text></TouchableOpacity>
        </View>
        {experiences.length===0&&(
          <View style={s.empty}>
            <Text style={{fontSize:44,marginBottom:12}}>💼</Text>
            <Text style={s.emptyTitle}>No Experience Added</Text>
            <Text style={s.emptySub}>Add jobs, internships or freelance work</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openAdd}><Text style={s.emptyBtnTxt}>+ Add Experience</Text></TouchableOpacity>
          </View>
        )}
        {experiences.map(exp=><Card key={exp.id} exp={exp} onEdit={openEdit} onDelete={onDelete}/>)}
        <View style={s.tip}><Text style={s.tipTxt}>💡 Use action verbs: Developed, Led, Built, Managed. Add numbers when possible.</Text></View>
      </ScrollView>
      <View style={s.nav}>
        <Button title="← Back" variant="ghost" onPress={()=>{dispatch(prevStep());navigation.goBack();}} style={{flex:1}}/>
        <Button title="Save Draft" variant="secondary" onPress={async()=>{await dispatch(saveDraftAll());Alert.alert('Success','Draft saved successfully!');}} style={{flex:1}}/>
        <Button title="Next →" onPress={async()=>{await dispatch(saveDraftAll());dispatch(nextStep());navigation.navigate('Step06');}} style={{flex:1}}/>
      </View>
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:COLORS.bg}}>
          <View style={s.mHead}><Text style={s.mTitle}>{editItem?'Edit Experience':'Add Experience'}</Text><TouchableOpacity onPress={()=>setModal(false)}><Text style={{color:COLORS.textMuted,fontSize:26}}>✕</Text></TouchableOpacity></View>
          <ScrollView contentContainerStyle={{padding:20}}>
            <Controller name="company" control={control} rules={{required:'Company required'}} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Company Name" placeholder="Brainstation-23 Ltd." required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.company?.message}/>
            )}/>
            <Controller name="title" control={control} rules={{required:'Title required'}} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Job Title" placeholder="Junior Software Engineer" required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message}/>
            )}/>
            <View style={{flexDirection:'row',gap:10}}>
              <View style={{flex:1}}>
                <Controller name="fromDate" control={control} render={({field:{onChange,onBlur,value}})=>(
                  <InputField label="From (Month Year)" placeholder="Jan 2023" value={value} onChangeText={onChange} onBlur={onBlur}/>
                )}/>
              </View>
              <View style={{flex:1}}>
                <Controller name="toDate" control={control} render={({field:{onChange,onBlur,value}})=>(
                  <InputField label="To" placeholder="Dec 2024" value={value} onChangeText={onChange} onBlur={onBlur} editable={!isCurrent}/>
                )}/>
              </View>
            </View>
            <View style={s.switchRow}>
              <Text style={s.switchLabel}>Currently working here</Text>
              <Switch value={isCurrent} onValueChange={setIsCurrent} trackColor={{true:COLORS.accent}} thumbColor={isCurrent?COLORS.white:COLORS.textMuted}/>
            </View>
            <Controller name="description" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Responsibilities & Achievements" placeholder="• Developed REST APIs with Node.js&#10;• Led team of 3 developers&#10;• Improved performance by 40%" value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={5}/>
            )}/>
            <Button title={editItem?'Save Changes':'Add Experience'} onPress={handleSubmit(onSave)}/>
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
  card:{backgroundColor:COLORS.bgCard,borderRadius:14,padding:16,marginBottom:12,borderWidth:1,borderColor:COLORS.border,borderLeftWidth:4,borderLeftColor:COLORS.accent},
  cardTitle:{fontSize:15,fontWeight:'800',color:COLORS.text},
  cardSub:{fontSize:13,color:COLORS.accent,fontWeight:'600',marginTop:2},
  cardMeta:{fontSize:11,color:COLORS.textMuted,marginTop:2},
  cardDesc:{fontSize:13,color:COLORS.textDim,lineHeight:20,marginTop:8},
  iconBtn:{width:32,height:32,borderRadius:8,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center'},
  tip:{backgroundColor:'#0D2B1F',borderRadius:10,padding:14,marginTop:8,borderWidth:1,borderColor:'#10B98130'},
  tipTxt:{fontSize:12,color:'#6EE7B7',lineHeight:20},
  nav:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mTitle:{fontSize:18,fontWeight:'800',color:COLORS.text},
  switchRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:COLORS.surface,padding:14,borderRadius:10,marginBottom:14},
  switchLabel:{fontSize:14,color:COLORS.text,fontWeight:'600'},
});
