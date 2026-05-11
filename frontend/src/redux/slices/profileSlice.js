// profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileAPI } from '../../api/profile.api';

export const fetchProfile = createAsyncThunk('profile/fetch', async (_, { rejectWithValue }) => {
  try { const res = await profileAPI.get(); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateProfile = createAsyncThunk('profile/update', async (data, { rejectWithValue }) => {
  try { const res = await profileAPI.update(data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: { data: null, completion: 0, isLoading: false, error: null },
  reducers: {
    setCompletion: (state, action) => { state.completion = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (s) => { s.isLoading = true; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.isLoading = false; s.data = a.payload.profile; s.completion = a.payload.completion; })
      .addCase(fetchProfile.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.data = a.payload.profile; });
  },
});

export const { setCompletion } = profileSlice.actions;
export default profileSlice.reducer;
