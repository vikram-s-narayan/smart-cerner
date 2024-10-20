import React, { useEffect, useState } from "react";
import axios from "axios";
import PatientBanner from "./components/PatientBanner";
import GetPatientVitals from "./components/GetPatientVitals";
import CreateVital from "./components/CreateVital";

function App() {
  const [iss, setIss] = useState(null);
  const [launch, setLaunch] = useState(null);
  const [authorizationEndpoint, setAuthorizationEndpoint] = useState(null);
  const [tokenEndpoint, setTokenEndpoint] = useState(null);
  const [code, setCode] = useState(null);
  const [accessData, setAccessData] = useState(null);

  //get and set iss and launch variables
  useEffect(() => {
    // Check local storage first
    let storedIss = localStorage.getItem("iss");
    let storedLaunch = localStorage.getItem("launch");

    if (!storedIss || !storedLaunch) {
      const urlParams = new URLSearchParams(window.location.search);
      storedIss = urlParams.get("iss");
      storedLaunch = urlParams.get("launch");
      if (storedIss) localStorage.setItem("iss", storedIss);
      if (storedLaunch) localStorage.setItem("launch", storedLaunch);
    }
    setIss(storedIss);
    setLaunch(storedLaunch);
  }, []);

  //get and set authorizationEndpoint and tokenEndpoint variables
  useEffect(() => {
    let storedAuthorizationEndpoint = localStorage.getItem(
      "authorizationEndpoint"
    );
    let storedTokenEndpoint = localStorage.getItem("tokenEndpoint");
    if (!storedAuthorizationEndpoint && !storedTokenEndpoint) {
      const fetchSmartConfiguration = async () => {
        let configURL = iss + "/.well-known/smart-configuration";
        const smartConfiguration = await axios.get(configURL);
        let auth_endpoint = smartConfiguration.data.authorization_endpoint;
        let token_endpoint = smartConfiguration.data.token_endpoint;
        localStorage.setItem("authorizationEndpoint", auth_endpoint);
        localStorage.setItem("tokenEndpoint", token_endpoint);
        setAuthorizationEndpoint(auth_endpoint);
        setTokenEndpoint(token_endpoint);
      };
      if (iss) {
        fetchSmartConfiguration();
      }
    } else {
      setAuthorizationEndpoint(storedAuthorizationEndpoint);
      setTokenEndpoint(storedTokenEndpoint);
    }
  }, [iss]);

  //get and set code variable
  useEffect(() => {
    let storedCode = localStorage.getItem("code");

    if (storedCode) {
      // If code is in local storage, set the state
      setCode(storedCode);
    } else {
      // Otherwise, check if the code is in the URL
      const URLParams = new URLSearchParams(window.location.search);
      const code = URLParams.get("code");

      if (code) {
        // If code is present in the URL, save to state and local storage
        setCode(code);
        localStorage.setItem("code", code);
      } else if (authorizationEndpoint) {
        // If code is not in URL, redirect to authorizationEndpoint
        const clientId = "123cdfcf-2178-44a1-8350-ecc43d2782af";
        const scope =
          "openid fhirUser launch user/Patient.read user/Observation.read user/Observation.write";
        const redirectUri = "http://127.0.0.1:3000";
        const state = "123456";

        const authUrl = `${authorizationEndpoint}?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
          scope
        )}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&aud=${encodeURIComponent(iss)}&state=${state}&launch=${launch}`;

        window.location.href = authUrl;
      }
    }
  }, [authorizationEndpoint, iss, launch]);

  //get and set accessToken and accessData variables
  useEffect(() => {
    let storedAccessData = localStorage.getItem("accessData");
    if (storedAccessData) {
      setAccessData(JSON.parse(storedAccessData));
    } else if (code && tokenEndpoint) {
      const exchangeCodeForToken = async () => {
        const tokenRequestBody = new URLSearchParams();
        tokenRequestBody.set("grant_type", "authorization_code");
        tokenRequestBody.set("code", code);
        tokenRequestBody.set("redirect_uri", "http://127.0.0.1:3000");
        tokenRequestBody.set(
          "client_id",
          "123cdfcf-2178-44a1-8350-ecc43d2782af"
        );

        try {
          console.log(tokenRequestBody);
          const response = await axios.post(tokenEndpoint, tokenRequestBody, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });

          if (response.data.access_token) {
            localStorage.setItem("accessData", JSON.stringify(response.data));
            console.log("Access token received:", response.data.access_token);
            console.log("and this is response.data:", response.data);
            window.location.reload(); //reload the page to get the new accessData
          } else {
            console.error("No access token received");
          }
        } catch (error) {
          console.error("Error exchanging code for token:", error);
        }
      };
      exchangeCodeForToken();
    }
  }, [code, tokenEndpoint]);

  return (
    <div>
      <PatientBanner accessData={accessData} iss={iss} />
      <CreateVital accessData={accessData} iss={iss} />
      <GetPatientVitals accessData={accessData} iss={iss} />
    </div>
  );
}

export default App;
