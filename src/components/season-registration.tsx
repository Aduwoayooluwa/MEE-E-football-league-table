import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Alert, Typography, Progress, Divider, Badge } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  StarOutlined
} from '@ant-design/icons';
import { seasonService } from '../services/seasons';
import { Season } from '../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface RegistrationFormValues {
  player_name: string;
  email: string;
}

export default function SeasonRegistration() {
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCurrentSeason();
  }, []);

  const fetchCurrentSeason = async () => {
    try {
      setLoading(true);
      const season = await seasonService.getSeasonOpenForRegistration();
      setCurrentSeason(season);
    } catch (error) {
      console.error('Error fetching current season:', error);
      setCurrentSeason(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (values: RegistrationFormValues) => {
    if (!currentSeason) {
      message.error('No active season found');
      return;
    }

    try {
      setSubmitting(true);
      
      const now = new Date();
      const registrationEnd = new Date(currentSeason.registration_end_date);
      
      if (now > registrationEnd) {
        message.error('Registration period has ended for this season');
        return;
      }

      const registrationData = {
        season_id: currentSeason.$id,
        user_id: 'temp_user_' + Date.now(),
        player_name: values.player_name,
        email: values.email,
        status: 'registered' as const,
        session_id: 'session_' + Date.now(), // Generate a unique session ID
      };

      await seasonService.registerForSeason(registrationData);
      message.success('Registration submitted successfully! Please wait for admin approval.');
      form.resetFields();
    } catch (error) {
      console.error('Error registering for season:', error);
      message.error('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isRegistrationOpen = () => {
    if (!currentSeason) return false;
    
    const now = new Date();
    const registrationStart = new Date(currentSeason.registration_start_date);
    const registrationEnd = new Date(currentSeason.registration_end_date);
    
    return now >= registrationStart && now <= registrationEnd;
  };

  const getRegistrationProgress = () => {
    if (!currentSeason) return 0;
    
    const now = new Date();
    const registrationStart = new Date(currentSeason.registration_start_date);
    const registrationEnd = new Date(currentSeason.registration_end_date);
    const totalDuration = registrationEnd.getTime() - registrationStart.getTime();
    const elapsed = now.getTime() - registrationStart.getTime();
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const getTimeRemaining = () => {
    if (!currentSeason) return null;
    
    const now = new Date();
    const registrationEnd = new Date(currentSeason.registration_end_date);
    const timeLeft = registrationEnd.getTime() - now.getTime();
    
    if (timeLeft <= 0) return null;
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const getRegistrationStatus = () => {
    if (!currentSeason) {
      return {
        type: 'info' as const,
        message: 'No active season available for registration.',
        showForm: false,
        icon: <InfoCircleOutlined />
      };
    }

    if (currentSeason.status === 'registration_open' && isRegistrationOpen()) {
      return {
        type: 'success' as const,
        message: `Registration is open for ${currentSeason.name}!`,
        showForm: true,
        icon: <CheckCircleOutlined />
      };
    }

    if (currentSeason.status === 'active') {
      return {
        type: 'warning' as const,
        message: `${currentSeason.name} is currently active. Registration is closed.`,
        showForm: false,
        icon: <TrophyOutlined />
      };
    }

    if (currentSeason.status === 'ended') {
      return {
        type: 'info' as const,
        message: `${currentSeason.name} has ended.`,
        showForm: false,
        icon: <InfoCircleOutlined />
      };
    }

    return {
      type: 'info' as const,
      message: 'Registration is not currently open.',
      showForm: false,
      icon: <InfoCircleOutlined />
    };
  };

  const status = getRegistrationStatus();
  const timeRemaining = getTimeRemaining();
  const progress = getRegistrationProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl  border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Text className="text-lg text-gray-600">Loading season information...</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
                     <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6 shadow">
            <TrophyOutlined className="text-2xl text-white" />
          </div>
          <Title 
            level={1} 
                         className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-4"
          >
            Season Registration
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join the ultimate football league experience. Register now and compete for glory!
          </Paragraph>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Season Info Card */}
          <div className="md:col-span-2">
                         <Card className=" border-0 bg-white/80 backdrop-blur-sm">
              {currentSeason ? (
                <div className="space-y-6">
                  {/* Season Header */}
                  <div className="text-center">
                    <Badge.Ribbon 
                      text={status.type === 'success' ? 'OPEN' : 'CLOSED'} 
                      color={status.type === 'success' ? 'green' : 'red'}
                    >
                                             <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-lg">
                        <p className="text-white! mb-2 text-2xl font-boldgit ">
                          {currentSeason.name}
                        </p>
                        {currentSeason.description && (
                          <Paragraph className="text-blue-100 mb-0">
                            {currentSeason.description}
                          </Paragraph>
                        )}
                      </div>
                    </Badge.Ribbon>
                  </div>

                  {/* Registration Progress */}
                  {status.showForm && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Text strong className="text-lg">Registration Progress</Text>
                        <Text type="secondary">{Math.round(progress)}%</Text>
                      </div>
                      <Progress 
                        percent={progress} 
                        strokeColor={{
                          '0%': '#3b82f6',
                          '100%': '#8b5cf6',
                        }}
                        showInfo={false}
                        strokeWidth={12}
                      />
                      
                      {timeRemaining && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <ClockCircleOutlined className="text-orange-600" />
                            <Text strong className="text-orange-800">Time Remaining</Text>
                          </div>
                          <div className="flex gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-orange-600">{timeRemaining.days}</div>
                              <div className="text-sm text-orange-600">Days</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-orange-600">{timeRemaining.hours}</div>
                              <div className="text-sm text-orange-600">Hours</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-orange-600">{timeRemaining.minutes}</div>
                              <div className="text-sm text-orange-600">Minutes</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Registration Period */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarOutlined className="text-blue-600" />
                      <Text strong className="text-lg">Registration Period</Text>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <Text type="secondary" className="text-sm">Start Date</Text>
                        <div className="font-semibold">
                          {dayjs(currentSeason.registration_start_date).format('MMM DD, YYYY')}
                        </div>
                        <Text type="secondary" className="text-xs">
                          {dayjs(currentSeason.registration_start_date).format('HH:mm')}
                        </Text>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <Text type="secondary" className="text-sm">End Date</Text>
                        <div className="font-semibold">
                          {dayjs(currentSeason.registration_end_date).format('MMM DD, YYYY')}
                        </div>
                        <Text type="secondary" className="text-xs">
                          {dayjs(currentSeason.registration_end_date).format('HH:mm')}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <InfoCircleOutlined className="text-2xl text-gray-400" />
                  </div>
                  <Title level={3} className="text-gray-600 mb-2">No Active Season</Title>
                  <Text type="secondary">There are currently no seasons open for registration.</Text>
                </div>
              )}
            </Card>
          </div>

          {/* Registration Form Card */}
          <div className="md:col-span-1">
                         <Card className=" border-0 bg-white/80 backdrop-blur-sm h-fit">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserOutlined className="text-xl text-white" />
                </div>
                <Title level={3} className="mb-2">Join the League</Title>
                <Text type="secondary">Complete your registration below</Text>
              </div>

              {status.showForm ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleRegistration}
                  className="space-y-4"
                >
                  <Form.Item
                    label={<span className="font-medium">Player Name</span>}
                    name="player_name"
                    rules={[
                      { required: true, message: 'Please enter your player name!' },
                      { min: 2, message: 'Player name must be at least 2 characters!' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined className="text-gray-400" />} 
                      placeholder="Enter your player name"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-medium">Email Address</span>}
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email!' },
                      { type: 'email', message: 'Please enter a valid email address!' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined className="text-gray-400" />} 
                      placeholder="Enter your email address"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item className="mb-0">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      className="h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 border-0 hover:from-blue-600 hover:to-indigo-600"
                    >
                      Register Now
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    {status.icon}
                  </div>
                  <Text type="secondary" className="block mb-4">
                    {status.message}
                  </Text>
                  <Button 
                    type="default" 
                    size="large" 
                    className="rounded-lg"
                    disabled
                  >
                    Registration Closed
                  </Button>
                </div>
              )}

              {/* Benefits Section */}
              <Divider />
              <div className="space-y-3">
                <Text strong className="block text-center mb-3">Why Join?</Text>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StarOutlined className="text-yellow-500" />
                    <Text className="text-sm">Competitive matches</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarOutlined className="text-yellow-500" />
                    <Text className="text-sm">Professional statistics</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarOutlined className="text-yellow-500" />
                    <Text className="text-sm">Trophy opportunities</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarOutlined className="text-yellow-500" />
                    <Text className="text-sm">Community of players</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Status Alert */}
        <div className="mt-6">
          <Alert
            message={status.message}
            type={status.type}
            showIcon
            className="rounded-lg"
            icon={status.icon}
          />
        </div>
      </div>
    </div>
  );
} 