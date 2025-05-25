import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import { Login, Logout } from "./Store/AuthSlice"
import { Header } from './Components'
import { Outlet, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import { ScaleLoader } from 'react-spinners'

const apiBaseUrl = import.meta.env.VITE_REACT_APP_API_BASE_URL;

function App() {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios
        .get(`${apiBaseUrl}/api/v1/users/current-user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(async (response) => {
          if (response.data && response.data.data) {
            await dispatch(Login({ user: response.data.data, token: token }));
          }
        })
        .catch((error) => {
          navigate('/login');
          console.error('Error fetching user data:', error);
        })
        .finally(() => setLoading(false));
    } else {
      navigate('/login');
      dispatch(Logout());
      setLoading(false);
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="w-full flex flex-col justify-center items-center bg-black py-12">
        <div className="p-4 w-full flex flex-col justify-center items-center">
        </div>
        <div className='mt-[5rem]'>
          <ScaleLoader color="#ffffff" height={50} />
        </div>
      </div>
    );
  }

  return !loading ? (
    <div  className='min-h-screen overflow-hidden overflow-x-hidden flex flex-wrap content-between bg-black text-black w-full'>
      <div className='w-full min-h-screen mb-5'>
        <Header />
        <ToastContainer />
        <main>
          <Outlet />
        </main>

      </div>
    </div>
  ) : null
}

export default App