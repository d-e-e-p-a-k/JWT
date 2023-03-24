import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import Cookies from "js-cookie";

function App() {
    const [user, setUser] = useState({});
    const [err, setErr] = useState("");

    const refresh = refreshToken => {
        console.log("Refreshing token!");

        return new Promise((resolve, reject) => {
            axios
                .post("http://localhost:4000/refresh", { token: refreshToken })
                .then(data => {
                    if (data.data.success === false) {
                        setErr("Login again");
                        // set message and return.
                        resolve(false);
                    } else {
                        const { accessToken } = data.data;
                        Cookies.set("access", accessToken);
                        resolve(accessToken);
                    }
                });
        });
    };

    const requestLogin = async (accessToken, refreshToken) => {
        console.log(accessToken, refreshToken);
        //console.log("accessToken,accessToken);
        return new Promise((resolve, reject) => {
            axios
                .post(
                    "http://localhost:4000/protected",
                    {},
                    { headers: { authorization: `Bearer ${accessToken}` } }
                )
                .then(async data => {
                    if (data.data.success === false) {
                        if (data.data.message === "User not authenticated") {
                            setErr("Login again");
                        } else if (data.data.message === "Access token expired")
                            {
                            const accessToken = await refresh(refreshToken);
                            return await requestLogin(
                                accessToken,
                                refreshToken
                            );
                        }

                        resolve(false);
                    } else {
                        setErr("Protected route accessed!");
                        //console.log("refreshToken",refreshToken);
                        resolve(true);
                    }
                });
        });
    };

    const handleChange = e => {
        setUser({ ...user, [e.target.name]: e.target.value });
        console.log(user);
    };

    const handleSubmit = e => {
        e.preventDefault();
        axios.post("http://localhost:4000/login", { user }).then(data => {
            const { accessToken, refreshToken } = data.data;

            Cookies.set("access", accessToken);
            Cookies.set("refresh", refreshToken);
        });
    };

    const hasAccess = async (accessToken, refreshToken) => {
        if (!refreshToken) return null;

        if (accessToken === undefined) {
            // generate new accessToken
            accessToken = await refresh(refreshToken);
            return accessToken;
        }

        return accessToken;
    };

    const protect = async e => {
        let accessToken = Cookies.get("access");
        let refreshToken = Cookies.get("refresh");

        accessToken = await hasAccess(accessToken, refreshToken);

        if (!accessToken) {
            setErr("Login Again!");
        } else {
            await requestLogin(accessToken, refreshToken);
        }
    };

    return (
        <div className="App">
            <h1>ISAA Project-JWT</h1><hr></hr>
            <form action="" onChange={handleChange} onSubmit={handleSubmit}>
                Email:<br></br><input name="email" type="email" placeholder="Email address" required />
                <br />
                <br />

                Password:<br></br><input name="password" type="password" placeholder="Password" required/>
                <br />
                <br />
                <input type="submit" value="Login" />
                <br />
                <br />
            </form>
            {err}
            <button onClick={protect}>Access Protected Content</button>
        </div>
    );
}

export default App;
