import React, { useState, useEffect } from 'react';
import { handleApiError } from './../app';

const Profile = () => {
    const [profilePic, setProfilePic] = useState('/assets/generic_profile.jpeg');
    const [username, setUsername] = useState('Unknown');
    const [familyCode, setFamilyCode] = useState('Unknown');

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        const response = await fetch('/api/user', {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            await handleApiError(response);
        }
        const userData = await response.json();
        setUsername(userData.username || 'Unknown');
        setFamilyCode(userData.familyCode || 'Unknown');
        setProfilePic(userData.profilePic || '/assets/generic_profile.jpeg');
    };

    const handleProfilePicChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePic', file);
        const response = await fetch('/api/user/profile-pic', {
            method: 'PUT',
            body: formData,
            credentials: 'include',
        });
        if (!response.ok) {
            await handleApiError(response);
        }
        fetchUserInfo();  // Refresh user info to update profile picture
    };

    return (
        <div className="profile">
            <img id="profilePic" src={profilePic} alt="Profile Picture" />
            <br />
            <label htmlFor="profilePicInput" className="fileInputLabel">
                Choose a profile picture
            </label>
            <input
                type="file"
                id="profilePicInput"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
            />
            <div id="userInfo">
                Username: <span className="userDisplay" id="usernameDisplay">{username}</span>
                <br />
                Family Code: <span className="userDisplay" id="familyCodeDisplay">{familyCode}</span>
            </div>
        </div>
    );
};

export default Profile;
