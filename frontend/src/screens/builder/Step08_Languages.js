import React,{useState} from 'react';
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Modal,TextInput} from 'react-native';
import {useDispatch,useSelector} from 'react-redux';
import {updateLanguages,nextStep,prevStep,saveDraftAll} from '../../redux/slices/builderSlice';
import {Alert} from 'react-native';
import {COLORS} from '../../theme/colors';
import Button from '../../components/common/Button';
import {StepHeader} from '../../components/common/StepIndicator';

const LEVELS=['Basic','Intermediate','Good','Fluent','Native'];
const LEVEL_COLORS={Basic:COLORS.textMuted,Intermediate:COLORS.gold,Good:COLORS.accent,Fluent:COLORS.emerald,Native:'#A855F7'};
const DEFAULT_LANGS=[{name:'Bangla',reading:'Native',writing:'Native',speaking:'Native'},{name:'English',reading:'Good',writing:'Good',speaking:'Good'}];

const LevelBar=({value,onChange})=>(
  <View style={{flexDirection:'row',gap:4,flexWrap:'wrap'}}>
    {LEVELS.map(l=>{
      const color=LEVEL_COLORS[l]||COLORS.accent;
      const active=value===l;
      return(
        <TouchableOpacity key={l} onPress={()=>onChange(l)} style={[s.lvl,active&&{backgroundColor:color+'30',borderColor:color}]}>
          <Text style={[s.lvlTxt,active&&{color,fontWeight:'800'}]}>{l}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function Step08_Languages({navigation}){
  const dispatch=useDispatch();
  const saved=useSelector(st=>st.builder.languages);
  const isSaving=useSelector(s=>s.builder.isSaving);
  const [langs,setLangs]=useState(saved.length>0?saved:DEFAULT_LANGS);
  const [addModal,setAddModal]=useState(false);
  const [newLang,setNewLang]=useState('');

  const update=(i,field,val)=>{
    const updated=langs.map((l,idx)=>idx===i?{...l,[field]:val}:l);
    setLangs(updated);
  };
  const removeLang=(i)=>setLangs(prev=>prev.filter((_,idx)=>idx!==i));
  const addLang=()=>{
    if(newLang.trim()){setLangs(prev=>[...prev,{name:newLang.trim(),reading:'Basic',writing:'Basic',speaking:'Basic'}]);setNewLang('');setAddModal(false);}
  };
  const onNext=async()=>{dispatch(updateLanguages(langs));await dispatch(saveDraftAll());dispatch(nextStep());navigation.navigate('Step09');};
  const onSaveDraft=async()=>{dispatch(updateLanguages(langs));await dispatch(saveDraftAll());Alert.alert('Success','Draft saved successfully!');};

  return(
    <View style={{flex:1,backgroundColor:COLORS.bg}}>
      <StepHeader step={8} totalSteps={11}/>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topRow}>
          <Text style={s.secTitle}>{langs.length} Language(s)</Text>
          <TouchableOpacity style={s.addBtn} onPress={()=>setAddModal(true)}><Text style={s.addBtnTxt}>+ Add</Text></TouchableOpacity>
        </View>
        {langs.map((lang,i)=>(
          <View key={i} style={s.card}>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:14}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
                <Text style={{fontSize:22}}>🌐</Text>
                <Text style={s.langName}>{lang.name}</Text>
              </View>
              {i>1&&<TouchableOpacity onPress={()=>removeLang(i)}><Text style={{color:COLORS.rose,fontSize:18}}>🗑️</Text></TouchableOpacity>}
            </View>
            {['reading','writing','speaking'].map(skill=>(
              <View key={skill} style={s.skillRow}>
                <Text style={s.skillLabel}>{skill.charAt(0).toUpperCase()+skill.slice(1)}</Text>
                <LevelBar value={lang[skill]} onChange={val=>update(i,skill,val)}/>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={s.nav}>
        <Button title="← Back" variant="ghost" onPress={()=>{dispatch(prevStep());navigation.goBack();}} style={{flex:1}} disabled={isSaving}/>
        <Button title={isSaving?'Saving...':'Save Draft'} variant="secondary" onPress={onSaveDraft} style={{flex:1}} disabled={isSaving}/>
        <Button title="Next →" onPress={onNext} style={{flex:1}} disabled={isSaving}/>
      </View>
      <Modal visible={addModal} animationType="fade" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.mTitle}>Add Language</Text>
            <TextInput value={newLang} onChangeText={setNewLang} placeholder="e.g. Hindi, Arabic, French" placeholderTextColor={COLORS.textMuted} style={s.mInput} autoFocus/>
            <View style={{flexDirection:'row',gap:10,marginTop:16}}>
              <Button title="Cancel" variant="ghost" onPress={()=>setAddModal(false)} style={{flex:1}}/>
              <Button title="Add" onPress={addLang} style={{flex:1}}/>
            </View>
          </View>
        </View>
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
  card:{backgroundColor:COLORS.bgCard,borderRadius:14,padding:16,marginBottom:14,borderWidth:1,borderColor:COLORS.border},
  langName:{fontSize:17,fontWeight:'800',color:COLORS.text},
  skillRow:{marginBottom:12},
  skillLabel:{fontSize:11,fontWeight:'700',color:COLORS.textDim,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8},
  lvl:{paddingHorizontal:10,paddingVertical:5,borderRadius:100,backgroundColor:COLORS.surface,borderWidth:1,borderColor:COLORS.border,marginRight:4,marginBottom:4},
  lvlTxt:{fontSize:11,color:COLORS.textMuted,fontWeight:'500'},
  nav:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:COLORS.border,backgroundColor:COLORS.bgCard},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',alignItems:'center'},
  modal:{backgroundColor:COLORS.bgCard,borderRadius:16,padding:24,width:'80%',borderWidth:1,borderColor:COLORS.border},
  mTitle:{fontSize:18,fontWeight:'800',color:COLORS.text,marginBottom:14},
  mInput:{backgroundColor:COLORS.surface,borderRadius:10,borderWidth:1,borderColor:COLORS.border,padding:12,color:COLORS.text,fontSize:15},
});
