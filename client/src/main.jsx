/* eslint-disable react-refresh/only-export-components */
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./Store/Store.js";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import ProtectRoute from "./utility/ProtectRoute.jsx";
import HomePage from "../src/Pages/HomePage.jsx"
import Login from "./Components/Login.jsx";
import SignUpPage from "../src/Pages/SignUpPage.jsx"
import SearchMovie from "../src/Pages/SearchMovie.jsx"
import AddPost from "../src/Pages/AddPost.jsx"
import EditPosts from "../src/Pages/EditPosts.jsx"
import Post from "../src/Pages/Post.jsx"
import AllPosts from "../src/Pages/AllPosts.jsx"
import UserProfile from "../src/Pages/UserProfile.jsx"
import MyFollowers from "../src/Pages/MyFollowers.jsx"
import MyFollowings from "../src/Pages/MyFollowings.jsx"
import Authors from "./Pages/Authors.jsx";
import DashBoard from "./Pages/DashBoard.jsx";
import Chat from "./Pages/Chat.jsx";
import Conversations from "./Pages/Conversations.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route element = {<ProtectRoute/>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/add-post" element={<SearchMovie />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/all-posts/:userId" element={<AllPosts />} />
        <Route path="/edit-post/:postId" element={<EditPosts />} />
        <Route path="/post/:postId" element={<Post />} />
        <Route path="/posts/:userId" element={<AllPosts />} />
        <Route path="/add-content" element={<AddPost />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/followers/:userId" element={<MyFollowers />} />
        <Route path="/followings/:userId" element={<MyFollowings />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/conversations" element={<Conversations />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    {/* <Suspense fallback={<Loading />}> */}
      <RouterProvider router={router} />
    {/* </Suspense> */}
  </Provider>
);
