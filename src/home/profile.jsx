import React from 'react';

const Profile = () => {
    return (
        <div className="profile">
            <img id="profilePic" src="assets/generic_profile.jpeg" alt="Profile Picture" />
            <br />
            <label htmlFor="profilePicInput" className="fileInputLabel">
                Choose a profile picture
            </label>
            <input
                type="file"
                id="profilePicInput"
                accept="image/*"
                style={{ display: 'none' }}
            //  onChange= handleProfilePicChange
            />
            <div id="userInfo">
                Username: <span className="userDisplay" id="usernameDisplay"></span>
                <br />
                Family Code: <span className="userDisplay" id="familyCodeDisplay"></span>
            </div>
        </div>
    );
};

export default Profile;