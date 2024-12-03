import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import Cookies from 'js-cookie';
import { account } from '../services/appwrite';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await account.createEmailPasswordSession(values.email, values.password);
      const user = await account.get();
      console.log('User logged in:', user);

      Cookies.set('adminSession', JSON.stringify(user), { expires: 1 });
      message.success('Login successful!');
      navigate('/admin');
    } catch (error) {
      console.error('Login failed:', error);
      message.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-500">
      <div className="w-full max-w-md px-6 py-8 bg-white shadow-sm rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Please login to access the Admin Panel
        </p>
        <Form
          onFinish={handleLogin}
          layout="vertical"
          className="space-y-4"
          size="large"
        >
          <Form.Item
            label={<span className="text-gray-700">Email Address</span>}
            name="email"
            rules={[{ required: true, message: 'Please enter your email!' }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            label={<span className="text-gray-700">Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
        
          >
            Login
          </Button>
        </Form>

      </div>
    </div>
  );
}
