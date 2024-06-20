/* global google */

import React, { useState, useEffect } from "react";
import axios from "axios";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// const SCOPES = "https://www.googleapis.com/auth/tasks";

function App() {
	const [todos, setTodos] = useState([]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [accessToken, setAccessToken] = useState(null);
	const [taskLists, setTaskLists] = useState([]);
	const [selectedTaskListId, setSelectedTaskListId] = useState(null);

	useEffect(() => {
		const handleGoogleSignIn = (response) => {
			if (response.credential) {
				const idToken = response.credential;
				setAccessToken(idToken);
				setIsLoggedIn(true);
				if (selectedTaskListId) {
					fetchTodos(selectedTaskListId);
				}
			}
		};

		const initializeGoogleSignIn = () => {
			if (window.google && window.google.accounts) {
				google.accounts.id.initialize({
					client_id: CLIENT_ID,
					callback: handleGoogleSignIn,
				});

				google.accounts.id.renderButton(
					document.getElementById("signInButton"),
					{ theme: "outline", size: "large" }
				);

				google.accounts.id.prompt();
			} else {
				console.error("Google Identity Services not loaded.");
			}
		};

		if (window.google && window.google.accounts) {
			initializeGoogleSignIn();
		} else {
			window.addEventListener("load", initializeGoogleSignIn);
		}

		return () => {
			window.removeEventListener("load", initializeGoogleSignIn);
		};
	}, [selectedTaskListId]);

	useEffect(() => {
		if (accessToken) {
			getTaskListIDs();
		}
	}, [accessToken]);

	const getTaskListIDs = async () => {
		try {

			// const response = await axios.post("/tasks", { accessToken });
			// console.log(response)
			const response = await axios.get(
				"https://tasks.googleapis.com/v1/tasklists",
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			const taskLists = response.data.items || [];
			setTaskLists(taskLists);
		} catch (error) {
			console.error(error);
		}
	};

	const fetchTodos = async (taskListId) => {
		try {
			const response = await axios.get(
				`https://tasks.googleapis.com/v1/tasks/${taskListId}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			setTodos(response.data.tasks || []);
		} catch (error) {
			console.error(error);
		}
	};

	const handleSignOut = () => {
		if (window.google && window.google.accounts) {
			google.accounts.id.disableAutoSelect();
		}
		setAccessToken(null);
		setIsLoggedIn(false);
		setTodos([]);
	};

	const handleSelectTaskList = (event) => {
		setSelectedTaskListId(event.target.value);
	};

	const addTodo = async (title) => {
		try {
			const response = await axios.post(
				`https://tasks.googleapis.com/v1/tasks`,
				{
					title,
					status: "needsAction",
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						"Content-Type": "application/json",
					},
				}
			);
			setTodos([...todos, response.data]);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="App">
			<h1>TODO List</h1>
			{isLoggedIn ? (
				selectedTaskListId ? (
					<>
						
						<ul>will display all the task here</ul>
						<button onClick={handleSignOut}>Sign Out</button>
					</>
				) : (
					<p>Select a task list to manage:</p>
				)
			) : (
				<div id="signInButton"></div>
			)}
			{taskLists.length > 0 && (
				<select value={selectedTaskListId} onChange={handleSelectTaskList}>
					{taskLists.map((taskList) => (
						<option key={taskList.id} value={taskList.id}>
							{taskList.title}
						</option>
					))}
				</select>
			)}
		</div>
	);
}

export default App;
