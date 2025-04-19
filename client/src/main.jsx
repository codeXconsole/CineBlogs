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
import { lazy, Suspense } from "react";
import { ScaleLoader } from "react-spinners";
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

// const HomePage = lazy(() => import("./Pages/HomePage.jsx"));
// const Login = lazy(() => import("./Components/Login.jsx"));
// const SignUpPage = lazy(() => import("./Pages/SignUpPage.jsx"));
// const SearchMovie = lazy(() => import("./Pages/SearchMovie.jsx"));
// const AddPost = lazy(() => import("./Pages/AddPost.jsx"));
// const EditPosts = lazy(() => import("./Pages/EditPosts.jsx"));
// const Post = lazy(() => import("./Pages/Post.jsx"));
// const AllPosts = lazy(() => import("./Pages/AllPosts.jsx"));
// const UserProfile = lazy(() => import("./Pages/UserProfile.jsx"));
// const MyFollowers = lazy(() => import("./Pages/MyFollowers.jsx"));
// const MyFollowings = lazy(() => import("./Pages/MyFollowings.jsx"));

// const Loading = () => (
//   <div className="w-full h-full flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black py-12">
//     <div className="p-4 w-full flex flex-col justify-center items-center">
//       <h1 className="text-4xl font-semibold text-white">
//         "Patience, the Best Stories Are Worth the Wait."
//       </h1>
//       <p className="text-lg mt-2 text-gray-300">
//         We’re brewing something great! Check back soon for fresh content.
//       </p>
//     </div>
//     <div className='mt-[5rem]'>
//       <ScaleLoader color="#ffffff" height={50} />
//     </div>
//   </div>
// );


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route element = {<ProtectRoute/>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-post" element={<SearchMovie />} />
        <Route path="/all-posts/:userId" element={<AllPosts />} />
        <Route path="/edit-post/:postId" element={<EditPosts />} />
        <Route path="/post/:postId" element={<Post />} />
        <Route path="/posts/:userId" element={<AllPosts />} />
        <Route path="/add-content" element={<AddPost />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/followers/:userId" element={<MyFollowers />} />
        <Route path="/followings/:userId" element={<MyFollowings />} />
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
