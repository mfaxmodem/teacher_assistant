import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Shield } from 'lucide-react';
import { Button } from './ui/button';

const ForgotPasswordPage = ({ onBack, onResetComplete }) => {
  const [step, setStep] = useState(1); // 1: mobile input, 2: OTP verification, 3: new password
  const [formData, setFormData] = useState({
    mobile: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to verify OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to reset password
    setTimeout(() => {
      setIsLoading(false);
      onResetComplete();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 rtl">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">چ</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">بازیابی رمز عبور</h1>
          <p className="text-gray-600">
            {step === 1 && 'شماره موبایل خود را وارد کنید'}
            {step === 2 && 'کد تأیید ارسال شده را وارد کنید'}
            {step === 3 && 'رمز عبور جدید خود را تعیین کنید'}
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Mobile Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="شماره موبایل خود را وارد کنید"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.mobile.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    ارسال کد تأیید
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  کد تأیید
                </label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center tracking-widest"
                    placeholder="کد 6 رقمی"
                    maxLength="6"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  کد تأیید به شماره {formData.mobile} ارسال شد
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  بازگشت
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || formData.otp.length !== 6}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'تأیید کد'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور جدید
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pr-4 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="رمز عبور جدید"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  تکرار رمز عبور جدید
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pr-4 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="تکرار رمز عبور جدید"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  بازگشت
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'تغییر رمز عبور'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              بازگشت به صفحه ورود
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

