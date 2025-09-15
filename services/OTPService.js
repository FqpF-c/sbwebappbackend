const axios = require('axios');

/**
 * OTP Service for handling 2Factor.in API integration
 */
class OTPService {
  constructor() {
    this.API_BASE_URL = 'https://2factor.in/API/V1';
    this.API_KEY = process.env.TWOFACTOR_API_KEY;

    if (!this.API_KEY) {
      console.warn('⚠️ TWOFACTOR_API_KEY not found in environment variables');
    }
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid
   */
  validatePhoneNumber(phone) {
    // Remove any non-digits
    const cleanPhone = phone.replace(/\D/g, '');

    // Should be exactly 10 digits
    return cleanPhone.length === 10 && /^\d{10}$/.test(cleanPhone);
  }

  /**
   * Format phone number to clean 10-digit format
   * @param {string} phone - Raw phone number
   * @returns {string} - Clean 10-digit phone number
   */
  formatPhoneNumber(phone) {
    return phone.replace(/\D/g, '');
  }

  /**
   * Parse 2Factor.in error messages for better user experience
   * @param {string} errorMessage - Raw error from 2Factor.in API
   * @returns {string} - User-friendly error message
   */
  parseErrorMessage(errorMessage) {
    if (!errorMessage) return 'Failed to send OTP';

    const error = errorMessage.toLowerCase();

    if (error.includes('invalid number') || error.includes('invalid mobile')) {
      return 'Invalid phone number format. Please check and try again.';
    }
    if (error.includes('dnd') || error.includes('do not disturb')) {
      return 'Your number is on DND. Please disable DND or try with a different number.';
    }
    if (error.includes('rate limit') || error.includes('too many requests')) {
      return 'Too many requests. Please wait a few minutes before trying again.';
    }
    if (error.includes('insufficient balance') || error.includes('low balance')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (error.includes('operator issue') || error.includes('network error')) {
      return 'Network issue with your carrier. Please try again in a few minutes.';
    }
    if (error.includes('blocked') || error.includes('blacklist')) {
      return 'This number cannot receive OTP messages. Please contact support.';
    }

    return errorMessage; // Return original if no specific pattern matched
  }

  /**
   * Parse verification error messages
   * @param {string} errorMessage - Raw error from verification API
   * @returns {string} - User-friendly error message
   */
  parseVerificationError(errorMessage) {
    if (!errorMessage) return 'Invalid verification code. Please check and try again.';

    const error = errorMessage.toLowerCase();

    if (error.includes('invalid otp') || error.includes('wrong otp') || error.includes('incorrect')) {
      return 'Invalid OTP code. Please check the code and try again.';
    }
    if (error.includes('expired') || error.includes('timeout')) {
      return 'OTP code has expired. Please request a new code.';
    }
    if (error.includes('already verified') || error.includes('already used')) {
      return 'This OTP code has already been used. Please request a new code.';
    }
    if (error.includes('session not found') || error.includes('invalid session')) {
      return 'Verification session not found. Please request a new OTP.';
    }

    return 'Verification failed. Please try again or request a new code.';
  }

  /**
   * Send OTP via 2Factor.in API
   * @param {string} phoneNumber - 10-digit phone number
   * @returns {Promise<Object>} - API response
   */
  async sendOTP(phoneNumber) {
    try {
      if (!this.API_KEY) {
        throw new Error('2Factor.in API key not configured');
      }

      // Validate and format phone number
      const cleanPhone = this.formatPhoneNumber(phoneNumber);

      if (!this.validatePhoneNumber(cleanPhone)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please enter a valid 10-digit number.'
        };
      }

      console.log(`📱 Sending OTP to: +91${cleanPhone}`);

      // Construct 2Factor.in API URL
      const url = `${this.API_BASE_URL}/${this.API_KEY}/SMS/+91${cleanPhone}/AUTOGEN/OTP1`;

      // Make API request
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🔄 2Factor.in API Response:', response.data);

      // Check if request was successful
      if (response.data.Status === 'Success') {
        const sessionId = response.data.Details;

        console.log(`✅ OTP sent successfully. Session ID: ${sessionId}`);

        return {
          success: true,
          sessionId: sessionId,
          message: 'OTP sent successfully to your phone number.',
          phone: `+91${cleanPhone}`
        };
      } else {
        const errorMessage = this.parseErrorMessage(response.data.Details);
        console.error('❌ 2Factor.in API Error:', response.data);

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error.message);

      // Handle different types of errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.'
        };
      }

      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout. Please try again.'
        };
      }

      if (error.response) {
        // API returned an error response
        const errorMessage = this.parseErrorMessage(error.response.data?.Details || error.response.data?.message);
        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Verify OTP via 2Factor.in API
   * @param {string} sessionId - Session ID from sendOTP
   * @param {string} otp - OTP code entered by user
   * @returns {Promise<Object>} - Verification result
   */
  async verifyOTP(sessionId, otp) {
    try {
      if (!this.API_KEY) {
        throw new Error('2Factor.in API key not configured');
      }

      // Validate inputs
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required for verification.'
        };
      }

      if (!otp || !/^\d{6}$/.test(otp)) {
        return {
          success: false,
          error: 'Please enter a valid 6-digit OTP code.'
        };
      }

      console.log(`🔍 Verifying OTP for session: ${sessionId}`);

      // Construct 2Factor.in verification URL
      const url = `${this.API_BASE_URL}/${this.API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;

      // Make API request
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🔄 2Factor.in Verification Response:', response.data);

      // Check if verification was successful
      if (response.data.Status === 'Success') {
        console.log('✅ OTP verified successfully');

        return {
          success: true,
          message: 'OTP verified successfully.'
        };
      } else {
        const errorMessage = this.parseVerificationError(response.data.Details);
        console.error('❌ OTP verification failed:', response.data);

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error.message);

      // Handle different types of errors
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'Network error. Please check your internet connection and try again.'
        };
      }

      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout. Please try again.'
        };
      }

      if (error.response) {
        // API returned an error response
        const errorMessage = this.parseVerificationError(error.response.data?.Details || error.response.data?.message);
        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred during verification. Please try again.'
      };
    }
  }
}

module.exports = new OTPService();