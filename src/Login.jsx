import React, { useState, useEffect } from "react";
import axios from "axios";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [name, setName] = useState("");

    const getTaskListIDs = async (accessToken) => {
        try {
            const response = await axios.get(
                "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const taskLists = response.data.items || [];
            console.log(taskLists);
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error Response:', error.response.data);
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error Request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error Message:', error.message);
            }
            console.error('Config:', error.config);
        }
    };
    
	useEffect(() => {
		const initializeGoogleSignIn = () => {
			if (window.google && window.google.accounts) {
				window.google.accounts.id.initialize({
					client_id: clientId,
					callback: handleCredentialResponse,
				});
				window.google.accounts.id.renderButton(
					document.getElementById("googleSignInButton"),
					{ theme: "outline", size: "large" } // customization attributes
				);
			} else {
				console.error("Google Identity Services library failed to load.");
			}
		};

		const handleCredentialResponse = (response) => {
			const token = response.credential;
			const userObject = parseJwt(token);
			setIsSignedIn(true);
			setName(userObject.name);
            getTaskListIDs(token)
		};

		const parseJwt = (token) => {
			const base64Url = token.split(".")[1];
			const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split("")
					.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
					.join("")
			);
			return JSON.parse(jsonPayload);
		};

		if (window.google) {
			initializeGoogleSignIn();
		} else {
			console.error("Google API client library not loaded yet.");
			// Retry loading after a delay
			const intervalId = setInterval(() => {
				if (window.google) {
					clearInterval(intervalId);
					initializeGoogleSignIn();
				}
			}, 1000);
		}
	}, []);

	const handleSignoutClick = () => {
		setIsSignedIn(false);
		setName("");
	};

	return (
		<div>
			<p>Say hello using the People API.</p>
			{isSignedIn ? (
				<div>
					<button onClick={handleSignoutClick}>Sign Out</button>
					<p>Hello, {name}!</p>
				</div>
			) : (
				<div id="googleSignInButton"></div>
			)}
		</div>
	);
};

export default Login;
