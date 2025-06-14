const {
  REDIRECT_URIS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = require("../../utils/constants");

module.exports = async function GET(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    if (!state) {
      return res.status(400).json({ error: "Missing state parameter" });
    }

    // Parse state to get platform
    let platform;
    try {
      const stateObj = JSON.parse(state);
      platform = stateObj.platform;
    } catch (e) {
      console.error('Invalid state format:', e);
      return res.status(400).json({ error: "Invalid state parameter" });
    }

    // Get the appropriate redirect URI based on platform
    const redirectUri = REDIRECT_URIS[platform];
    if (!redirectUri) {
      return res.status(400).json({ error: "Invalid platform" });
    }

    // Construct the outgoing parameters
    const params = new URLSearchParams({
      code: code,
      platform,
    });

    // Redirect to the appropriate URI with the parameters
    const redirectUrl = `${redirectUri}?${params.toString()}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Callback error:', error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to process OAuth callback"
    });
  }
};
