import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import ForgotPasswordPage from './ForgotPasswordPage';
import apiService from '../services/api';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    teachingHistory: "",
    mainCourseTitle: "",
    technicalField: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await apiService.login({
          mobile: formData.mobile,
          password: formData.password,
        });
        
        onLogin(response.user);
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('رمز عبور و تکرار آن یکسان نیستند');
          return;
        }
        
        const response = await apiService.register(formData);
        
        // After successful registration, automatically login
        const loginResponse = await apiService.login({
          mobile: formData.mobile,
          password: formData.password,
        });
        
        onLogin(loginResponse.user);
      }
    } catch (error) {
      setError(error.message || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showForgotPassword ? (
        <ForgotPasswordPage 
          onBack={() => setShowForgotPassword(false)}
          onResetComplete={() => {
            setShowForgotPassword(false);
            setIsLogin(true);
          }}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 rtl">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">چ</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">دستیار هوشمند</h1>
          <p className="text-gray-600">
            {isLogin ? 'به حساب کاربری خود وارد شوید' : 'حساب کاربری جدید ایجاد کنید'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field for signup */}
            {!isLogin && (
              <div className="space-y-6">
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
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="teachingHistory" className="block text-sm font-medium text-gray-700 mb-2">
                    سابقه تدریس
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="teachingHistory"
                      name="teachingHistory"
                      value={formData.teachingHistory}
                      onChange={handleInputChange}
                      className="w-full pr-4 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="مثال: 5 به عدد وارد کنید"
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mainCourseTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان درس اصلی
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="mainCourseTitle"
                      name="mainCourseTitle"
                      value={formData.mainCourseTitle}
                      onChange={handleInputChange}
                      className="w-full pr-4 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="مثال: برق خودرو"
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="technicalField" className="block text-sm font-medium text-gray-700 mb-2">
                    رشته فنی
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="technicalField"
                      name="technicalField"
                      value={formData.technicalField}
                      onChange={handleInputChange}
                      className="w-full pr-4 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="مثال: مکانیک"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile field for login only */}
            {isLogin && (
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
            )}

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="رمز عبور خود را وارد کنید"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field for signup */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  تکرار رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="رمز عبور را مجدداً وارد کنید"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Forgot Password Link for login */}
            {isLogin && (
              <div className="text-left">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  رمز عبور را فراموش کرده‌اید؟
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? 'ورود' : 'ثبت‌نام'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
              <button
                type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              }}
                className="text-blue-600 hover:text-blue-800 font-medium mr-1"
              >
                {isLogin ? 'ثبت‌نام کنید' : 'وارد شوید'}
              </button>
            </p>
          </div>

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">یا</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="mr-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span className="mr-2">GitHub</span>
              </button>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-8 text-center text-sm text-gray-600">
          با {isLogin ? 'ورود' : 'ثبت‌نام'} شما با{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">قوانین و مقررات</a>
          {' '}و{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">حریم خصوصی</a>
          {' '}ما موافقت می‌کنید.
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default AuthPage;