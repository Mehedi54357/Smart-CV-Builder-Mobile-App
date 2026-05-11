import React,{useState} from 'react';
import {View,Text,StyleSheet,ScrollView,Modal,TouchableOpacity,Alert,KeyboardAvoidingView,Platform} from 'react-native';
import {useForm,Controller} from 'react-hook-form';
import {useDispatch,useSelector} from 'react-redux';
import {addProject,removeProject,nextStep,prevStep,saveDraftAll} from '../../redux/slices/builderSlice';
import {COLORS} from '../../theme/colors';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import {StepHeader} from '../../components/common/StepIndicator';

export default function Step06_Projects({navigation}){
  const dispatch=useDispatch();
  const projects=useSelector(s=>s.builder.projects);
  const [modal,setModal]=useState(false);
  const {control,handleSubmit,reset,formState:{errors}}=useForm();

  const onAdd=(data)=>{
    const techs=data.technologies?data.technologies.split(',').map(t=>t.trim()).filter(Boolean):[];
    dispatch(addProject({...data,technologies:techs}));
    reset();setModal(false);
  };
  const onDelete=(id)=>Alert.alert('Delete Project?','',[ {text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>dispatch(removeProject(id))}]);

  return(
    <View style={{flex:1,backgroundColor:COLORS.bg}}>
      <StepHeader step={6} totalSteps={11}/>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topRow}>
          <Text style={s.secTitle}>{projects.length} Project(s)</Text>
          <TouchableOpacity style={s.addBtn} onPress={()=>setModal(true)}><Text style={s.addBtnTxt}>+ Add</Text></TouchableOpacity>
        </View>
        {projects.length===0&&(
          <View style={s.empty}>
            <Text style={{fontSize:44,marginBottom:12}}>🖥️</Text>
            <Text style={s.emptyTitle}>No Projects Yet</Text>
            <Text style={s.emptySub}>Showcase your best work — personal, academic or freelance</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={()=>setModal(true)}><Text style={s.emptyBtnTxt}>+ Add Project</Text></TouchableOpacity>
          </View>
        )}
        {projects.map(proj=>(
          <View key={proj.id} style={s.card}>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
              <View style={{flex:1}}>
                <Text style={s.cardTitle}>{proj.title}</Text>
                {proj.role?<Text style={s.cardRole}>Role: {proj.role}</Text>:null}
              </View>
              <TouchableOpacity style={s.delBtn} onPress={()=>onDelete(proj.id)}><Text>🗑️</Text></TouchableOpacity>
            </View>
            {proj.technologies?.length>0&&<View style={s.techRow}>{proj.technologies.map((t,i)=><View key={i} style={s.techTag}><Text style={s.techTxt}>{t}</Text></View>)}</View>}
            {proj.description?<Text style={s.cardDesc} numberOfLines={3}>{proj.description}</Text>:null}
            <View style={s.linkRow}>
              {proj.githubLink?<Text style={s.link}>🔗 GitHub</Text>:null}
              {proj.liveLink?<Text style={s.link}>🌐 Live Demo</Text>:null}
            </View>
          </View>
        ))}
        <View style={s.tip}><Text style={s.tipTxt}>💡 Include GitHub links and live demos — recruiters love to see working projects!</Text></View>
      </ScrollView>
      <View style={s.nav}>
        <Button title="← Back" variant="ghost" onPress={()=>{dispatch(prevStep());navigation.goBack();}} style={{flex:1}}/>
        <Button title="Save Draft" variant="secondary" onPress={async()=>{await dispatch(saveDraftAll());Alert.alert('Success','Draft saved successfully!');}} style={{flex:1}}/>
        <Button title="Next →" onPress={async()=>{await dispatch(saveDraftAll());dispatch(nextStep());navigation.navigate('Step07');}} style={{flex:1}}/>
      </View>
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:COLORS.bg}}>
          <View style={s.mHead}><Text style={s.mTitle}>Add Project</Text><TouchableOpacity onPress={()=>setModal(false)}><Text style={{color:COLORS.textMuted,fontSize:26}}>✕</Text></TouchableOpacity></View>
          <ScrollView contentContainerStyle={{padding:20}}>
            <Controller name="title" control={control} rules={{required:'Project title required'}} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Project Title" placeholder="E-Commerce Platform" required value={value} onChangeText={onChange} onBlur={onBlur} error={errors.title?.message}/>
            )}/>
            <Controller name="description" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Description" placeholder="A full-stack e-commerce app with payment integration, user auth, and admin panel..." value={value} onChangeText={onChange} onBlur={onBlur} multiline numberOfLines={4}/>
            )}/>
            <Controller name="technologies" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Technologies (comma separated)" placeholder="React Native, Node.js, MongoDB, Redis" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Controller name="role" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Your Role" placeholder="Full Stack Developer / Backend Lead" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Controller name="githubLink" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="GitHub Link (Optional)" placeholder="https://github.com/username/repo" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Controller name="liveLink" control={control} render={({field:{onChange,onBlur,value}})=>(
              <InputField label="Live Demo URL (Optional)" placeholder="https://myapp.vercel.app" value={value} onChangeText={onChange} onBlur={onBlur}/>
            )}/>
            <Button title="Add Project" onPress={handleSubmit(onAdd)}/>
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
  card:{backgroundColor:COLORS.bgCard,borderRadius:14,padding:16,marginBottom:12,borderWidth:1,borderColor:COLORS.border,borderLeftWidth:4,borderLeftColor:COLORS.emerald},
  cardTitle:{fontSize:15,fontWeight:'800',color:COLORS.text},
  cardRole:{fontSize:12,color:COLORS.textMuted,marginTop:2},
  delBtn:{width:32,height:32,borderRadius:8,backgroundColor:COLORS.surface,alignItems:'center',justifyContent:'center'},
  techRow:{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:8},
  techTag:{backgroundColor:COLORS.accent+'20',borderRadius:6,paddingHorizontal:8,paddingVertical:3},
  techTxt:{fontSize:11,color:COLORS.accent,fontWeight:'600'},
  cardDesc:{fontSize:13,color:COLORS.textDim,lineHeight:20,marginBottom:8},
  linkRow:{flexDirection:'row',gap:12},
  link:{fontSize:12,color:COLORS.accent,fontWeight:'600'},
  tip:{backgroundColor:'#0D2B1F',borderRadius:10,padding:14,marginTop:8,borderWidth:1,borderColor:'#10B98130'},
  tipTxt:{fontSize:12,color:'#6EE7B7',lineHeight:20},
  nav:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20,borderBottomWidth:1,borderBottomColor:COLORS.border,backgroundColor:COLORS.bgCard},
  mTitle:{fontSize:18,fontWeight:'800',color:COLORS.text},
});
