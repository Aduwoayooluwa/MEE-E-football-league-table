/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { databases } from '../services/appwrite';

const DATABASE_ID = import.meta.env.VITE_DATABASE_ID;
const MATCH_RESULTS_COLLECTION_ID = import.meta.env.VITE_MATCH_RESULTS_COLLECTION_ID;

export default function EditMatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const match = await databases.getDocument(
          DATABASE_ID,
          MATCH_RESULTS_COLLECTION_ID,
          id
        );
        form.setFieldsValue(match);
      } catch (error) {
        console.error('Error fetching match:', error);
        message.error('Failed to fetch match details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        MATCH_RESULTS_COLLECTION_ID,
        id,
        values
      );
      message.success('Match updated successfully!');
      navigate('/league');
    } catch (error) {
      console.error('Error updating match:', error);
      message.error('Failed to update match.');
    }
  };

  return (
    <div className="container mx-auto max-w-md">
      <h2 className="text-xl font-semibold mb-4">Edit Match</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Team 1 Score"
          name="score1"
          rules={[{ required: true, message: 'Please enter score for Team 1' }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label="Team 2 Score"
          name="score2"
          rules={[{ required: true, message: 'Please enter score for Team 2' }]}
        >
          <Input type="number" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Update Match
        </Button>
      </Form>
    </div>
  );
}
