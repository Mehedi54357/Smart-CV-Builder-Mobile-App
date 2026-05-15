import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileAPI } from '../../api/profile.api';

const initialFormData = {
  // Step 1 — Personal
  fullName: '', fatherName: '', motherName: '',
  dob: '', gender: '', nationality: 'Bangladeshi',
  religion: '', maritalStatus: '', nid: '',
  passport: '', presentAddress: '', permanentAddress: '',
  profilePhoto: null,
  // Step 2 — Contact
  phone: '', altPhone: '', email: '',
  linkedin: '', github: '', portfolio: '',
  // Driving License (Specialized)
  licenseNo: '', licenseType: '', licenseIssueDate: '', licenseExpiryDate: '', licenseAuthority: '',
  // Step 3 — Objective
  // Step 3 — Objective
  objective: '',
  // Step 4-11 stored in profile API
};

export const saveDraftAll = createAsyncThunk('builder/saveDraftAll', async (_, { getState, rejectWithValue }) => {
  try {
    const { formData, educations, experiences, projects, skills, languages, references, extraInfo, isLoaded } = getState().builder;
    
    // SAFETY CHECK: Don't save if the data hasn't been loaded from the server yet
    // to avoid overwriting existing server data with empty initial state.
    if (!isLoaded) {
      console.warn('Attempted to save draft before data was loaded from server. Aborting.');
      return rejectWithValue('Data not loaded yet');
    }

    const res = await profileAPI.syncAll({ formData, educations, experiences, projects, skills, languages, references, extraInfo });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const builderSlice = createSlice({
  name: 'builder',
  initialState: {
    currentStep: 1,
    totalSteps: 11,
    formData: initialFormData,
    educations: [],
    experiences: [],
    projects: [],
    skills: { technical: [], soft: [], software: [] },
    languages: [],
    certifications: [],
    achievements: [],
    references: [],
    selectedTemplate: 'govt',
    isDirty: false,
    lastSaved: null,
    completionPct: 0,
    isSaving: false,
    isLoaded: false,
  },
  reducers: {
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) state.currentStep++;
    },
    prevStep: (state) => {
      if (state.currentStep > 1) state.currentStep--;
    },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
      state.isDirty = true;
    },
    addEducation: (state, action) => {
      state.educations.push({ ...action.payload, id: Date.now().toString() });
      state.isDirty = true;
    },
    updateEducation: (state, action) => {
      const idx = state.educations.findIndex(e => e.id === action.payload.id);
      if (idx !== -1) state.educations[idx] = action.payload;
    },
    removeEducation: (state, action) => {
      state.educations = state.educations.filter(e => e.id !== action.payload);
    },
    addExperience: (state, action) => {
      state.experiences.push({ ...action.payload, id: Date.now().toString() });
      state.isDirty = true;
    },
    updateExperience: (state, action) => {
      const idx = state.experiences.findIndex(e => e.id === action.payload.id);
      if (idx !== -1) state.experiences[idx] = action.payload;
    },
    removeExperience: (state, action) => {
      state.experiences = state.experiences.filter(e => e.id !== action.payload);
    },
    addProject: (state, action) => {
      state.projects.push({ ...action.payload, id: Date.now().toString() });
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
    },
    updateSkills: (state, action) => {
      state.skills = { ...state.skills, ...action.payload };
      state.isDirty = true;
    },
    updateLanguages: (state, action) => { state.languages = action.payload; },
    updateExtraInfo: (state, action) => {
      state.extraInfo = { ...state.extraInfo, ...action.payload };
      state.isDirty = true;
    },
    addCertification: (state, action) => { state.certifications.push(action.payload); },
    removeCertification: (state, action) => {
      state.certifications = state.certifications.filter((_, i) => i !== action.payload);
    },
    addAchievement: (state, action) => { state.achievements.push(action.payload); },
    addReference: (state, action) => { state.references.push(action.payload); },
    setTemplate: (state, action) => { state.selectedTemplate = action.payload; },
    markSaved: (state) => { state.isDirty = false; state.lastSaved = new Date().toISOString(); },
    resetBuilder: () => ({
      currentStep: 1, totalSteps: 11,
      formData: initialFormData,
      educations: [], experiences: [], projects: [],
      skills: { technical: [], soft: [], software: [] },
      languages: [], certifications: [], achievements: [], references: [],
      selectedTemplate: 'govt', isDirty: false, lastSaved: null,
    }),
    loadDraft: (state, action) => ({ ...state, ...action.payload }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveDraftAll.pending, (state) => { state.isSaving = true; })
      .addCase(saveDraftAll.fulfilled, (state, action) => {
        state.isSaving = false;
        state.isDirty = false;
        state.lastSaved = new Date().toISOString();
        if (action.payload.completion !== undefined) {
          state.completionPct = action.payload.completion;
        }
      })
      .addCase(saveDraftAll.rejected, (state) => { state.isSaving = false; })
      // Load fetched data from profile
      .addCase('profile/fetch/fulfilled', (state, action) => {
        const { profile, educations, experiences, projects, skills, completion } = action.payload;
        if (profile) {
          state.formData = { ...state.formData, ...profile };
        }
        if (educations) state.educations = educations;
        if (experiences) state.experiences = experiences;
        if (projects) state.projects = projects;
        if (skills) {
          state.skills = {
            technical: skills.technical || [],
            soft: skills.soft || [],
            software: skills.software || [],
          };
          state.languages = skills.languages || [];
        }
        if (profile?.references) state.references = profile.references;
        if (profile?.extraInfo) state.extraInfo = profile.extraInfo;
        if (completion !== undefined) state.completionPct = completion;
        state.isLoaded = true;
      })
      .addCase('auth/fetchCurrentUser/fulfilled', (state, action) => {
        if (action.payload.user?.profilePhoto) {
          state.formData.profilePhoto = action.payload.user.profilePhoto;
        }
      })
      .addCase('auth/login/fulfilled', (state, action) => {
        if (action.payload.user?.profilePhoto) {
          state.formData.profilePhoto = action.payload.user.profilePhoto;
        }
      });
  },
});

export const {
  setStep, nextStep, prevStep,
  updateFormData, addEducation, updateEducation, removeEducation,
  addExperience, updateExperience, removeExperience,
  addProject, removeProject, updateSkills, updateLanguages, updateExtraInfo,
  addCertification, removeCertification, addAchievement, addReference,
  setTemplate, markSaved, resetBuilder, loadDraft,
} = builderSlice.actions;

export default builderSlice.reducer;
