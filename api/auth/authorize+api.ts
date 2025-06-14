const express = require('express');
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
  REDIRECT_URIS,
} = require("../../utils/constants");

module.exports = async function GET(req, res) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "Google client ID not configured" });
    }

    const { redirect_uri, platform = 'native' } = req.query;

    // Validate redirect_uri
    if (!redirect_uri || !REDIRECT_URIS[platform]) {
      return res.status(400).json({ error: "Invalid redirect URI or platform" });
    }

    // Create state object with platform information
    const state = JSON.stringify({ platform });

    // Construct Google OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid profile email https://www.googleapis.com/auth/calendar",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.redirect(authUrl);
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to initiate OAuth flow"
    });
  }
};
