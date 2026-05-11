import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cvAPI } from '../../api/cv.api';

export const fetchCVs = createAsyncThunk('cv/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await cvAPI.getAll(); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const generateCV = createAsyncThunk('cv/generate', async (data, { rejectWithValue }) => {
  try { const res = await cvAPI.generate(data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteCV = createAsyncThunk('cv/delete', async (id, { rejectWithValue }) => {
  try { await cvAPI.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const cvSlice = createSlice({
  name: 'cv',
  initialState: { list: [], current: null, isLoading: false, isGenerating: false, error: null },
  reducers: {
    setCurrent: (state, action) => { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCVs.pending, (s) => { s.isLoading = true; })
      .addCase(fetchCVs.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload.cvs; })
      .addCase(fetchCVs.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(generateCV.pending, (s) => { s.isGenerating = true; })
      .addCase(generateCV.fulfilled, (s, a) => { s.isGenerating = false; s.list.unshift(a.payload.cv); s.current = a.payload.cv; })
      .addCase(generateCV.rejected, (s, a) => { s.isGenerating = false; s.error = a.payload; })
      .addCase(deleteCV.fulfilled, (s, a) => { s.list = s.list.filter(cv => cv._id !== a.payload); });
  },
});

export const { setCurrent } = cvSlice.actions;
export default cvSlice.reducer;
