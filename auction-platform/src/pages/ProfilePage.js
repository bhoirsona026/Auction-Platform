import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      setName(data.name);
      setProfilePic(data.profilePic);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    await axios.put(
      "http://localhost:5000/api/users/profile",
      { name, profilePic },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Profile updated!");
  };

  return (
    <div>
      <h2>User Profile</h2>
      <p>Email: {user.email}</p>
      <label>Name:</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>Profile Picture URL:</label>
      <input value={profilePic} onChange={(e) => setProfilePic(e.target.value)} />
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
};

export default ProfilePage;
