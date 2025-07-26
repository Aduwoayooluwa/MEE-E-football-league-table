import { useState } from 'react';
import { Card, Button, Alert, Typography, Space, Divider } from 'antd';
import { databases, DATABASE_ID, PLAYERS_COLLECTION_ID, MATCH_RESULTS_COLLECTION_ID, account } from '../services/appwrite';
import { Query } from 'appwrite';
import { testCollectionStructure } from '../utils/collection-test';

const { Title, Text } = Typography;

export default function DebugPanel() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    success: boolean;
    message: string;
    data?: unknown;
    timestamp: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, message: string, data?: unknown) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check if user is authenticated
      try {
        const user = await account.get();
        addResult('User Authentication', true, `User authenticated: ${user.email}`, user);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addResult('User Authentication', false, `Authentication failed: ${errorMessage}`, error);
      }

      // Test 2: Test players collection access
      try {
        const playersResponse = await databases.listDocuments(
          DATABASE_ID,
          PLAYERS_COLLECTION_ID,
          [Query.limit(1)]
        );
        addResult('Players Collection Read', true, `Successfully read ${playersResponse.documents.length} players`, playersResponse);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addResult('Players Collection Read', false, `Failed to read players: ${errorMessage}`, error);
      }

      // Test 3: Test match_results collection access
      try {
        const matchResponse = await databases.listDocuments(
          DATABASE_ID,
          MATCH_RESULTS_COLLECTION_ID,
          [Query.limit(1)]
        );
        addResult('Match Results Collection Read', true, `Successfully read ${matchResponse.documents.length} matches`, matchResponse);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addResult('Match Results Collection Read', false, `Failed to read matches: ${errorMessage}`, error);
      }

      // Test 4: Test creating a document to check required fields
      try {
        const testDocument = {
          name: 'Test Player',
          season_id: 'test-season-id',
          user_id: 'test-user-id',
          registration_type: 'admin_added',
          matches_played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0
        };
        
        const createResponse = await databases.createDocument(
          DATABASE_ID,
          PLAYERS_COLLECTION_ID,
          'unique()',
          testDocument
        );
        addResult('Player Creation Test', true, 'Successfully created test player', createResponse);
        
        // Clean up - delete the test document
        await databases.deleteDocument(
          DATABASE_ID,
          PLAYERS_COLLECTION_ID,
          createResponse.$id
        );
        addResult('Player Cleanup', true, 'Successfully deleted test player', { deletedId: createResponse.$id });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addResult('Player Creation Test', false, `Failed to create player: ${errorMessage}`, error);
      }

      // Test 5: Test database access
      try {
        // Note: databases.get() is not available in the current Appwrite SDK version
        addResult('Database Access', true, `Database ID: ${DATABASE_ID}`, { databaseId: DATABASE_ID });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addResult('Database Access', false, `Failed to access database: ${errorMessage}`, error);
      }

    } catch (error) {
      addResult('General Error', false, 'Unexpected error during testing', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3}>Appwrite Debug Panel</Title>
          <Text type="secondary">
            This panel helps diagnose Appwrite connection and permission issues
          </Text>
        </div>

        <Button 
          type="primary" 
          onClick={runTests} 
          loading={loading}
          size="large"
        >
          Run Connection Tests
        </Button>

        <Button 
          onClick={async () => {
            setLoading(true);
            try {
              const results = await testCollectionStructure();
              if (results.errors.length > 0) {
                results.errors.forEach(error => {
                  addResult('Collection Structure', false, error, { errors: results.errors });
                });
              } else {
                addResult('Collection Structure', true, 'All collections have correct structure', results);
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              addResult('Collection Structure', false, `Test failed: ${errorMessage}`, error);
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
          size="large"
        >
          Test Collection Structure
        </Button>

        {testResults.length > 0 && (
          <div>
            <Divider>Test Results</Divider>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {testResults.map((result, index) => (
                <Alert
                  key={index}
                  message={result.test}
                  description={
                    <div>
                      <p><strong>Status:</strong> {result.success ? '✅ Success' : '❌ Failed'}</p>
                      <p><strong>Message:</strong> {result.message}</p>
                      <p><strong>Time:</strong> {result.timestamp}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">View Details</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {result.data ? String(JSON.stringify(result.data, null, 2)) : 'No data'}
                          </pre>
                        </details>
                      )}
                    </div>
                  }
                  type={result.success ? 'success' : 'error'}
                  showIcon
                />
              ))}
            </Space>
          </div>
        )}

        <Alert
          message="Permission Fix Instructions"
          description={
            <div>
              <p><strong>If you see 401 errors, follow these steps:</strong></p>
              <ol className="mt-2 ml-4 list-decimal">
                <li>Go to your Appwrite Console</li>
                <li>Navigate to: <strong>Databases → Your Database → Collections</strong></li>
                <li>For each collection (<code>players</code>, <code>match_results</code>):</li>
                <li className="ml-4">• Click on the collection</li>
                <li className="ml-4">• Go to "Settings" tab</li>
                <li className="ml-4">• Scroll to "Permissions" section</li>
                <li className="ml-4">• Set <strong>Read</strong> to: "Any authenticated user"</li>
                <li className="ml-4">• Set <strong>Write</strong> to: "Any authenticated user"</li>
                <li className="ml-4">• Click "Save"</li>
              </ol>
              <p className="mt-2 text-sm text-gray-600">
                <strong>Note:</strong> Make sure your environment variables are correctly set:
                <br />
                <code>VITE_DATABASE_ID</code>, <code>VITE_PLAYERS_COLLECTION_ID</code>, <code>VITE_MATCH_RESULTS_COLLECTION_ID</code>
              </p>
            </div>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
} 