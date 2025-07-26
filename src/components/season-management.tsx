import { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Table, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, PlayCircleOutlined, StopOutlined, InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { seasonService } from '../services/seasons';
import { Season, SeasonRegistration } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface SeasonFormValues {
  name: string;
  description?: string;
  registration_start_date: dayjs.Dayjs;
  registration_end_date: dayjs.Dayjs;
}

export default function SeasonManagement() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [registrations, setRegistrations] = useState<SeasonRegistration[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const fetchedSeasons = await seasonService.getAllSeasons();
      setSeasons(fetchedSeasons);
    } catch {
      message.error('Failed to fetch seasons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const handleCreateSeason = async (values: SeasonFormValues) => {
    try {
      const seasonData = {
        name: values.name,
        description: values.description,
        status: 'registration_open' as const,
        registration_start_date: values.registration_start_date.toISOString(),
        registration_end_date: values.registration_end_date.toISOString(),
        season_start_date: values.registration_end_date.toISOString(), // Use registration end date as default season start
      };

      await seasonService.createSeason(seasonData);
      message.success('Season created successfully!');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchSeasons();
    } catch {
      message.error('Failed to create season');
    }
  };

  const handleStartSeason = async (seasonId: string) => {
    try {
      await seasonService.startSeason(seasonId);
      message.success('Season started successfully!');
      fetchSeasons();
    } catch {
      message.error('Failed to start season');
    }
  };

  const handleEndSeason = async (seasonId: string) => {
    try {
      await seasonService.endSeason(seasonId);
      message.success('Season ended successfully!');
      fetchSeasons();
    } catch {
      message.error('Failed to end season');
    }
  };

  const handleArchiveSeason = async (seasonId: string) => {
    try {
      await seasonService.archiveSeason(seasonId);
      message.success('Season archived successfully!');
      fetchSeasons();
    } catch {
      message.error('Failed to archive season');
    }
  };

  const handleDeleteSeason = async (seasonId: string) => {
    try {
      await seasonService.deleteSeason(seasonId);
      message.success('Season deleted successfully!');
      fetchSeasons();
    } catch {
      message.error('Failed to delete season');
    }
  };

  const fetchRegistrations = async (seasonId: string) => {
    try {
      const fetchedRegistrations = await seasonService.getSeasonRegistrations(seasonId);
      setRegistrations(fetchedRegistrations);
    } catch {
      message.error('Failed to fetch registrations');
    }
  };

  const handleViewRegistrations = (season: Season) => {
    setSelectedSeason(season);
    fetchRegistrations(season.$id);
  };

  const getStatusColor = (status: Season['status']) => {
    switch (status) {
      case 'registration_open': return 'blue';
      case 'active': return 'green';
      case 'ended': return 'orange';
      case 'archived': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status: Season['status']) => {
    switch (status) {
      case 'registration_open': return 'Registration Open';
      case 'active': return 'Active';
      case 'ended': return 'Ended';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const canStartSeason = (season: Season) => {
    return season.status === 'registration_open';
  };

  const canEndSeason = (season: Season) => {
    return season.status === 'active';
  };

  const canArchiveSeason = (season: Season) => {
    return season.status === 'ended';
  };

  const columns = [
    {
      title: 'Season Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Season['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Registration Period',
      key: 'registration_period',
      render: (record: Season) => (
        <div>
          <div>Start: {dayjs(record.registration_start_date).format('MMM DD, YYYY')}</div>
          <div>End: {dayjs(record.registration_end_date).format('MMM DD, YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Season) => (
        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            disabled={!canStartSeason(record)}
            onClick={() => handleStartSeason(record.$id)}
          >
            Start
          </Button>
          <Button 
            danger 
            icon={<StopOutlined />}
            disabled={!canEndSeason(record)}
            onClick={() => handleEndSeason(record.$id)}
          >
            End
          </Button>
          <Button 
            icon={<InboxOutlined />}
            disabled={!canArchiveSeason(record)}
            onClick={() => handleArchiveSeason(record.$id)}
          >
            Archive
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this season?"
            onConfirm={() => handleDeleteSeason(record.$id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
          <Button 
            type="link"
            onClick={() => handleViewRegistrations(record)}
          >
            View Registrations
          </Button>
        </Space>
      ),
    },
  ];

  const registrationColumns = [
    {
      title: 'Player Name',
      dataIndex: 'player_name',
      key: 'player_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'blue'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Registration Date',
      dataIndex: '$createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
    },
  ];

  return (
    <div>
      <Card 
        title="Season Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Season
          </Button>
        }
      >
        <Table
          loading={loading}
          dataSource={seasons}
          columns={columns}
          rowKey="$id"
          pagination={false}
          className='overflow-x-auto'
        />
      </Card>

      {/* Create Season Modal */}
      <Modal
        title="Create New Season"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSeason}
        >
          <Form.Item
            label="Season Name"
            name="name"
            rules={[{ required: true, message: 'Please enter season name!' }]}
          >
            <Input placeholder="e.g., Season 1, 2024 League" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea 
              placeholder="Optional description for the season"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Registration Start Date"
            name="registration_start_date"
            rules={[{ required: true, message: 'Please select registration start date!' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm"
              placeholder="Select start date and time"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Registration End Date"
            name="registration_end_date"
            rules={[{ required: true, message: 'Please select registration end date!' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm"
              placeholder="Select end date and time"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Season
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Registrations Modal */}
      <Modal
        title={`Registrations - ${selectedSeason?.name}`}
        open={!!selectedSeason}
        onCancel={() => setSelectedSeason(null)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={registrations}
          columns={registrationColumns}
          rowKey="$id"
          pagination={false}
        />
      </Modal>
    </div>
  );
} 