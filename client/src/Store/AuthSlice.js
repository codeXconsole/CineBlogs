import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status : false,
    userData: null,
    movie: null,
    homePageData: {
        data: [],
        isDataLoaded: false,
        currentPage: 1,
    },
}

const AuthSlice = createSlice({
    name: "Auth",
    initialState,
    reducers: {
        Login: (state, action) => {
            state.status = true;
            state.userData = action.payload.user;
            localStorage.setItem("authToken", action.payload.token);
        },
        Logout: (state) => {
            state.status = false;
            state.userData = null;
        },
        AddMovie: (state, action ) => {
            state.movie = action.payload;
        },
        RemoveMovie: (state)=>{
            state.movie = null;
        },
        AddHomePageData: (state, action) => {
            state.homePageData.data = action.payload.data;
            state.homePageData.isDataLoaded = action.payload.isDataLoaded;
            state.homePageData.currentPage = action.payload.currentPage;
        }
     }
})

export const {Login, Logout, AddMovie, RemoveMovie, AddHomePageData } = AuthSlice.actions;

export default AuthSlice.reducer;