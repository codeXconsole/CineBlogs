/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { IconButton, Stack, Avatar, Typography } from '@mui/material';
import { Edit as EditIcon, Done as DoneIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import MuiInput from '../utility/CustomeInput';
import { createFollow, getUserData, updateUserProfile } from '../AppWrite/Apibase';
import { Login } from "../Store/AuthSlice.js";
import BackButton from '../components/BackButton';

export default function UserProfile() {
  const [userData, setUser] = useState(null);
  const { userId } = useParams();
  const authToken = localStorage.getItem('authToken');
  const [isLoading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const dispatch = useDispatch();

  const appUser = useSelector((state) => state.Auth.userData);

  const inputFields = [
    { label: 'Username', name: 'username', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Bio', name: 'bio', type: 'text' }
  ];

  // Debounce user data fetching
  useEffect(() => {
    if (appUser) {
      const timer = setTimeout(() => {
        getUser();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [userId, appUser, isFollowing, isClicked]);

  const getUser = async () => {
    if (!appUser) return;
    try {
      const data = await getUserData(userId, authToken);
      setUser(data.data);
      setBio(data.data?.bio || '');
      setUsername(data.data?.username || '');
      setEmail(data.data?.email || '');
      setIsFollowing(data.data?.followers?.some((follow) => follow.follower._id === appUser?._id) || false);
      setIsAuthor(data.data?._id === appUser?._id);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setIsFollowing((prev) => !prev);
      setUser((prevUserData) => {
        const newFollowerCount = prevUserData.followers.length + (isFollowing ? -1 : 1);
        return { ...prevUserData, followers: Array(newFollowerCount).fill({}) };
      });

      await createFollow(userId, authToken);
    } catch (error) {
      setIsFollowing((prev) => !prev);
      setUser((prevUserData) => {
        const revertedFollowerCount = prevUserData.followers.length + (isFollowing ? 1 : -1);
        return { ...prevUserData, followers: Array(revertedFollowerCount).fill({}) };
      });
      toast.error("Error updating follow status.");
    }
  };


  const handleEdit = useCallback(async () => {
    if (isEdit) {
      setLoading(true);
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('username', username);
      formData.append('email', email);
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      try {
        const response = await updateUserProfile(formData, authToken);
        setUser(response.data);
        if (isAuthor) {
          dispatch(Login({ user: response.data, token: authToken }));
        }
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Error updating profile!");
      } finally {
        setLoading(false);
      }
    }
    setIsEdit(!isEdit);
  }, [isEdit, bio, username, email, selectedImage, authToken, dispatch, isAuthor]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  }, []);

  const followerCount = useMemo(() => userData?.followers?.length || 0, [userData]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#1e022c] to-black py-12">
        <div className="p-4 w-full flex flex-col justify-center items-center">
          <h1 className="text-4xl font-semibold text-white">
            "Patience, the Best Stories Are Worth the Wait."
          </h1>
          <p className="text-lg mt-2 text-gray-300">
            We’re brewing something great! Check back soon for fresh content.
          </p>
        </div>
        <div className='mt-[5rem]'>
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen flex flex-col items-center py-12 px-4">
      <div className="border-white border-[0.1px] shadow-sm shadow-white w-full max-w-[40rem] bg-gradient-to-b from-black via-[#12041c] to-black rounded-xl p-8 text-white text-center">
        <BackButton />
        <Stack direction="column" alignItems="center">
          <div className="relative">
            <Avatar
              src={selectedImage ? URL.createObjectURL(selectedImage) : userData?.profileImage}
              sx={{
                width: 150,
                height: 150,
                objectFit: 'cover',
                border: '3px solid #fff',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
              }}
              loading="lazy"
            />
            {isEdit && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  ':hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  },
                }}
                component="label"
              >
                <CameraAltIcon />
                <input type="file" hidden onChange={handleFileChange} />
              </IconButton>
            )}
          </div>
          <div className="mt-6 space-y-4">
            {inputFields.map(({ label, name, type }) => (
              isEdit ? (
                <MuiInput
                  key={name}
                  label={label}
                  type={type}
                  value={name === 'username' ? username : name === 'email' ? email : bio}
                  onChange={(e) => {
                    if (name === 'username') setUsername(e.target.value);
                    if (name === 'email') setEmail(e.target.value);
                    if (name === 'bio') setBio(e.target.value);
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiInputLabel-root': { color: 'white' },
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      '&.Mui-focused .MuiInputLabel-root': { color: 'white' },
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  }}
                />
              ) : (
                <Typography key={name} className="text-lg text-gray-300">
                  {name === 'username' ? username : name === 'email' ? email : bio}
                </Typography>
              )
            ))}
            <Typography className="text-gray-400">Joined: {new Date(userData?.createdAt).toLocaleDateString()}</Typography>
            {isEdit ? (
              <IconButton onClick={handleEdit} sx={{ mt: 2, color: 'white' }}>
                <DoneIcon />
              </IconButton>
            ) : (
              isAuthor && (
                <IconButton onClick={() => setIsEdit(true)} sx={{ mt: 2, color: 'white' }}>
                  <EditIcon />
                </IconButton>
              )
            )}
          </div>
        </Stack>

        <div className="flex justify-around mt-6 text-gray-300">
          <div>
            <p className="text-xl font-bold">{followerCount}</p>
            {followerCount > 0 ? (
              <Link to={`/followers/${userData?._id}`}>
                <p className="text-sm hover:scale-[1.05] hover:text-blue-500 duration-[0.3]">Followers</p>
              </Link>
            ) : (
              <p className="text-sm">Followers</p>
            )}
          </div>
          <div>
            <p className="text-xl font-bold">{userData?.posts || 0}</p>
            {
              userData?.posts > 0 ? (
                <Link to={`/posts/${userData?._id}`}>
                  <p className="text-sm hover:scale-[1.05] hover:text-blue-500 duration-[0.3]">Posts</p>
                </Link>
              ) : (<p className="text-sm">Posts</p>)
            }
          </div>
        </div>

        {appUser && userData && !isAuthor && (
          <button
            onClick={handleFollow}
            className="mt-8 px-6 py-2 rounded-full shadow-md transform transition-all duration-300 bg-gradient-to-r from-purple-500 to-indigo-600 hover:bg-indigo-700 hover:scale-105 text-white"
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
}
