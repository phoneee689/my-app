
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Button, Card, Spin, Alert, Typography, List } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const CVUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:3000/api/v1";

  const handleFileSelect = (file) => {
    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx"))
    ) {
      setSelectedFile(file);
      setError("");
      setSuccess("");
    } else {
      setError("Please select a valid CV file (PDF, DOC, or DOCX)");
      setSelectedFile(null);
    }
    return false; // Prevent automatic upload by Ant Design
  };

  const initializeSystem = async () => {
    try {
      const response = await fetch(`${API_BASE}/complete-flow/initialize`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to initialize system");
      }
      return await response.json();
    } catch (error) {
      console.error("Initialize error:", error);
      throw error;
    }
  };

  const uploadCV = async () => {
    if (!selectedFile) {
      setError("Please select a CV file first");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setJobRecommendations([]);

    try {
      setSuccess("🔄 Initializing recommendation system...");
      await initializeSystem();

      setSuccess("📤 Uploading and analyzing CV...");
      const formData = new FormData();
      formData.append("cvFile", selectedFile);

      const response = await fetch(`${API_BASE}/complete-flow/upload-cv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setJobRecommendations(result.data.jobRecommendations || []);
        setSuccess(
          `✅ Success! Found ${
            result.data.totalRecommendations || 0
          } job recommendations`
        );
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(`❌ Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: handleFileSelect,
    fileList: selectedFile ? [selectedFile] : [],
    onRemove: () => setSelectedFile(null),
    accept: ".pdf,.doc,.docx",
    showUploadList: {
      showRemoveIcon: true,
    },
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <Title level={2} className="text-center mb-4">
          📄 Upload Your CV
        </Title>
        <Paragraph className="text-center text-gray-600 mb-6">
          Upload your CV to get personalized job recommendations powered by AI
        </Paragraph>

        {/* File Upload Area */}
        <Upload
          {...uploadProps}
          className="flex justify-center"
          listType="picture"
        >
          <Button
            icon={<UploadOutlined />}
            size="large"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {selectedFile ? `Selected: ${selectedFile.name}` : "Select CV File"}
          </Button>
        </Upload>
        {selectedFile && (
          <div className="text-center mt-4">
            <Paragraph>
              File Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Paragraph>
          </div>
        )}
        {!selectedFile && (
          <div className="text-center mt-4 text-gray-500">
            <Paragraph>Supported formats: PDF, DOC, DOCX</Paragraph>
            <Paragraph>Maximum size: 10MB</Paragraph>
          </div>
        )}

        {/* Upload Button */}
        <div className="text-center mt-6">
          <Button
            type="primary"
            size="large"
            onClick={uploadCV}
            disabled={!selectedFile || isUploading}
            loading={isUploading}
            className="bg-green-500 hover:bg-green-600"
          >
            {isUploading ? "Processing..." : "🚀 Get Job Recommendations"}
          </Button>
        </div>

        {/* Messages */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mt-4 max-w-md mx-auto"
          />
        )}
        {success && (
          <Alert
            message={success}
            type="success"
            showIcon
            className="mt-4 max-w-md mx-auto"
          />
        )}

        {/* Loading Spinner */}
        {isUploading && (
          <div className="text-center mt-6">
            <Spin size="large" />
          </div>
        )}

        {/* Job Recommendations Results */}
        {jobRecommendations.length > 0 && (
          <div className="mt-8">
            <Title level={3} className="text-center">
              💼 Recommended Jobs ({jobRecommendations.length})
            </Title>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={jobRecommendations}
              renderItem={(job, index) => (
                <List.Item>
                  <Card
                    title={
                      <div className="flex justify-between items-center">
                        <span>{job.jobTitle || "Job Title"}</span>
                        <span className="text-green-500">
                          🎯 {job.matchPercentage || `${(job.score * 100).toFixed(1)}%`}
                        </span>
                      </div>
                    }
                    extra={<span className="text-gray-500">#{index + 1}</span>}
                    className="shadow-md"
                  >
                    <Paragraph>
                      <strong>🏢 Company:</strong> {job.company || "Company info available"}
                    </Paragraph>
                    <Paragraph>
                      <strong>📍 Location:</strong> {job.location || "Location not specified"}
                    </Paragraph>
                    <Paragraph>
                      <strong>🆔 Job ID:</strong> {job.jobId}
                    </Paragraph>
                    {job.description && (
                      <Paragraph>
                        <strong>📝 Description:</strong>
                        <br />
                        {job.description.length > 150
                          ? job.description.substring(0, 150) + "..."
                          : job.description}
                      </Paragraph>
                    )}
                    <div className="flex justify-between mt-4">
                      <Button
                        onClick={() => navigate(`/job/${job.jobId}`)}
                        type="primary"
                      >
                        📄 View Details
                      </Button>
                      {job.jobUrl && (
                        <Button
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          🔗 Original Job
                        </Button>
                      )}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}

        {/* No Results Message */}
        {!isUploading && jobRecommendations.length === 0 && selectedFile && (
          <Alert
            message="No job recommendations found. Try uploading a different CV or ensure your CV contains relevant skills and experience."
            type="info"
            showIcon
            className="mt-4 max-w-md mx-auto"
          />
        )}
      </Card>
    </div>
  );
};

export default CVUpload;
