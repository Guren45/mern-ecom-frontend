import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import { getUser, useLoginMutation } from "../redux/api/userAPI";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { MessageResponse } from "../types/api-types";
import { userExist, userNotExist } from "../redux/reducer/userReducer";
import { useDispatch } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();
  const [gender, setGender] = useState<string>("");
  const [date, setDate] = useState<string>("");

  const [login] = useLoginMutation();

  const loginHandler = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      if (!user) {
        toast.error("User authentication failed");
        return;
      }

      const userData = {
        name: user.displayName ?? "Unknown",
        email: user.email ?? "Unknown",
        photo: user.photoURL ?? "",
        gender,
        role: "user",
        dob: date,
        _id: user.uid,
      };

      const res = await login(userData);

      if ('data' in res && res.data) {
        toast.success(res.data.message);
        const userResponse = await getUser(user.uid);
        if (userResponse?.user) {
          dispatch(userExist(userResponse.user));
        } else {
          dispatch(userNotExist());
        }
      } else if ('error' in res && res.error) {
        const error = res.error as FetchBaseQueryError;
        const message = (error.data as MessageResponse)?.message ?? "An error occurred";
        toast.error(message);
        dispatch(userNotExist());
      } else {
        toast.error("An unexpected error occurred");
        dispatch(userNotExist());
      }

      // Ensure popup closes properly
      if (window.opener) {
        window.close();
      }
    } catch (error) {
      toast.error("Sign In Failed");
    }
  };

  return (
    <div className="login">
      <main>
        <h1 className="heading">Login</h1>

        <div>
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label>Date of birth</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <p>Already Signed In Once</p>
          <button onClick={loginHandler}>
            <FcGoogle /> <span>Sign in with Google</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
