const express = require('express');
const router = express.Router();
const OTPService = require('../services/OTPService');

/**
 * GET /otpget - Get API key (for backward compatibility)
 * Returns the 2Factor.in API key
 */
router.get('/otpget', (req, res) => {
  try {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'API key not configured'
      });
    }

    res.json({
      key: apiKey
    });
  } catch (error) {
    console.error('❌ Error in /otpget:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /send-otp - Send OTP to phone number
 * Body: { phone: "1234567890" }
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate request body
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    console.log(`📱 OTP request received for phone: ${phone}`);

    // Send OTP using OTPService
    const result = await OTPService.sendOTP(phone);

    // Return result with appropriate status code
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error) {
    console.error('❌ Error in /send-otp:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while sending OTP'
    });
  }
});

/**
 * POST /verify-otp - Verify OTP code
 * Body: { sessionId: "session123", otp: "123456" }
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    // Validate request body
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        error: 'OTP code is required'
      });
    }

    console.log(`🔍 OTP verification request for session: ${sessionId}`);

    // Verify OTP using OTPService
    const result = await OTPService.verifyOTP(sessionId, otp);

    // Return result with appropriate status code
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error) {
    console.error('❌ Error in /verify-otp:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while verifying OTP'
    });
  }
});

/**
 * Legacy endpoints for backward compatibility
 */

// POST /sendotp - Legacy endpoint
router.post('/sendotp', async (req, res) => {
  console.log('📌 Legacy /sendotp endpoint used, redirecting to /send-otp');

  // Extract phone from different possible field names
  const phone = req.body.phone || req.body.phoneNumber || req.body.mobile;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: 'Phone number is required'
    });
  }

  // Use the same logic as /send-otp
  try {
    const result = await OTPService.sendOTP(phone);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('❌ Error in legacy /sendotp:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while sending OTP'
    });
  }
});

// POST /verifyotp - Legacy endpoint
router.post('/verifyotp', async (req, res) => {
  console.log('📌 Legacy /verifyotp endpoint used, redirecting to /verify-otp');

  const { sessionId, otp } = req.body;

  if (!sessionId || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Session ID and OTP are required'
    });
  }

  // Use the same logic as /verify-otp
  try {
    const result = await OTPService.verifyOTP(sessionId, otp);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('❌ Error in legacy /verifyotp:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while verifying OTP'
    });
  }
});

module.exports = router;