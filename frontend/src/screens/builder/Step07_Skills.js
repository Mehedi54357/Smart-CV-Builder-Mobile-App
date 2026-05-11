import React,{useState} from 'react';
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,TextInput} from 'react-native';
import {useDispatch,useSelector} from 'react-redux';
import {updateSkills,nextStep,prevStep,saveDraftAll} from '../../redux/slices/builderSlice';
import {Alert} from 'react-native';
import {COLORS} from '../../theme/colors';
import Button from '../../components/common/Button';
import {StepHeader} from '../../components/common/StepIndicator';

const SUGGESTIONS={
  technical:['JavaScript','TypeScript','React.js','React Native','Node.js','Express.js','MongoDB','MySQL','PostgreSQL','Python','Django','PHP','Laravel','Java','Spring Boot','C++','Git','Docker','REST API','GraphQL','Redux','Firebase','AWS','Linux'],
  soft:['Team Leadership','Problem Solving','Communication','Time Management','Critical Thinking','Adaptability','Creativity','Collaboration','Presentation','Project Management'],
  software:['VS Code','Figma','Postman','Docker Desktop','Adobe XD','Adobe Photoshop','MS Office','Jira','Slack','Trello','Git','GitHub','GitLab','Android Studio','Xcode'],
};

const Section=({title,color,cat,skills,dispatch,updateSkills,allSkills})=>{
  const [input,setInput]=useState('');
  const suggestions=SUGGESTIONS[cat]||[];
  const addSkill=(val)=>{
    const trimmed=val.trim();
    if(trimmed&&!skills.includes(trimmed)) dispatch(updateSkills({...allSkills,[cat]:[...skills,trimmed]}));
  };
  const removeSkill=(idx)=>dispatch(updateSkills({...allSkills,[cat]:skills.filter((_,i)=>i!==idx)}));
  return(
    <View style={s.section}>
      <Text style={[s.secTitle,{color}]}>{title}</Text>
      <Text style={s.secCount}>{skills.length} skills added</Text>
      <View style={s.tagBox}>
        {skills.map((sk,i)=>(
          <TouchableOpacity key={i} onPress={()=>removeSkill(i)} style={[s.tag,{backgroundColor:color+'18',borderColor:color+'40'}]}>
            <Text style={[s.tagTxt,{color}]}>{sk}</Text>
            <Text style={[s.tagX,{color}]}>✕</Text>
          </TouchableOpacity>
        ))}
        <TextInput value={input} onChangeText={setInput} placeholder="Add skill..." placeholderTextColor={COLORS.textMuted} style={s.tagInput}
          onSubmitEditing={()=>{if(input.trim()){addSkill(input);setInput('');}}} returnKeyType="done" blurOnSubmit={false}/>
      </View>
      <Text style={s.suggestLabel}>Tap to add:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:'row',gap:6}}>
          {suggestions.filter(sg=>!skills.includes(sg)).slice(0,12).map(sg=>(
            <TouchableOpacity key={sg} style={s.suggest} onPress={()=>addSkill(sg)}>
              <Text style={s.suggestTxt}>+ {sg}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function Step07_Skills({navigation}){
  const dispatch=useDispatch();
  const skills=useSelector(s=>s.builder.skills);
  const isSaving=useSelector(s=>s.builder.isSaving);
  return(
    <View style={{flex:1,backgroundColor:COLORS.bg}}>
      <StepHeader step={7} totalSteps={11}/>
      <ScrollView contentContainerStyle={s.content}>
        <Section title="⚡ Technical Skills" color={COLORS.accent} cat="technical" skills={skills.technical} dispatch={dispatch} updateSkills={updateSkills} allSkills={skills}/>
        <Section title="🤝 Soft Skills" color={COLORS.emerald} cat="soft" skills={skills.soft} dispatch={dispatch} updateSkills={updateSkills} allSkills={skills}/>
        <Section title="🛠 Software & Tools" color={COLORS.gold} cat="software" skills={skills.software} dispatch={dispatch} updateSkills={updateSkills} allSkills={skills}/>
        <View style={s.scoreBox}>
          <Text style={s.scoreTitle}>🎯 Skills Score</Text>
          <Text style={s.scoreVal}>{Math.min(100,((skills.technical.length+skills.soft.length+skills.software.length)/20*100)).toFixed(0)}%</Text>
          <Text style={s.scoreSub}>Add at least 5 technical skills for best results</Text>
        </View>
      </ScrollView>
      <View style={s.nav}>
        <Button title="← Back" variant="ghost" onPress={()=>{dispatch(prevStep());navigation.goBack();}} style={{flex:1}} disabled={isSaving}/>
        <Button title={isSaving?'Saving...':'Save Draft'} variant="secondary" onPress={async()=>{await dispatch(saveDraftAll());Alert.alert('Success','Draft saved successfully!');}} style={{flex:1}} disabled={isSaving}/>
        <Button title="Next →" onPress={async()=>{await dispatch(saveDraftAll());dispatch(nextStep());navigation.navigate('Step08');}} style={{flex:1}} disabled={isSaving}/>
      </View>
    </View>
  );
}
const s=StyleSheet.create({
  content:{padding:16,paddingBottom:20},
  section:{backgroundColor:COLORS.bgCard,borderRadius:14,padding:16,marginBottom:16,borderWidth:1,borderColor:COLORS.border},
  secTitle:{fontSize:15,fontWeight:'800',marginBottom:2},
  secCount:{fontSize:11,color:COLORS.textMuted,marginBottom:10},
  tagBox:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:12,backgroundColor:COLORS.surface,borderRadius:10,padding:10,minHeight:50},
  tag:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:5,borderRadius:100,borderWidth:1},
  tagTxt:{fontSize:13,fontWeight:'600'},
  tagX:{fontSize:10,fontWeight:'900'},
  tagInput:{color:COLORS.text,fontSize:13,minWidth:100,paddingVertical:2},
  suggestLabel:{fontSize:10,color:COLORS.textMuted,fontWeight:'700',textTransform:'uppercase',letterSpacing:0.8,marginBottom:8},
  suggest:{backgroundColor:COLORS.surface,borderRadius:100,paddingHorizontal:12,paddingVertical:6,borderWidth:1,borderColor:COLORS.border},
  suggestTxt:{fontSize:12,color:COLORS.textDim},
  scoreBox:{backgroundColor:'#1E1B4B',borderRadius:14,padding:20,alignItems:'center',borderWidth:1,borderColor:COLORS.violet+'40'},
  scoreTitle:{fontSize:14,fontWeight:'700',color:COLORS.white,marginBottom:8},
  scoreVal:{fontSize:40,fontWeight:'900',color:COLORS.violet},
  scoreSub:{fontSize:12,color:'#A5B4FC',marginTop:6,textAlign:'center'},
  nav:{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:COLORS.border,backgroundColor:COLORS.bgCard},
});
