import { useSelector } from 'react-redux';
import Conversations from '../../Pages/Conversations';

export default function Overview() {
  const userData = useSelector((state) => state.Auth.userData);

  return (
    <div className="bg-black min-h-screen flex flex-col md:flex-row gap-8 p-6">
      <div className="w-full md:w-3/5">
        <Conversations />
      </div>
    </div>
  );
}