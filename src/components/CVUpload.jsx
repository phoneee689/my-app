import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Button, Card, Spin, Alert, Typography, List } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";

const { Title, Paragraph } = Typography;

const CVUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:3000/api/v1";

  const handleFileSelect = (file, fileList) => {
    const isValidFile = (f) =>
      f && (
        f.type === "application/pdf" ||
        f.name.endsWith(".pdf") ||
        f.name.endsWith(".doc") ||
        f.name.endsWith(".docx")
      );

    const validFiles = fileList.filter(isValidFile);
    if (validFiles.length !== fileList.length) {
      setError("Please select valid CV files (PDF, DOC, or DOCX)");
    } else {
      setError("");
      setSuccess("");
    }
    setFileList(validFiles);
    return false; // Prevent automatic upload
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
    if (fileList.length === 0) {
      setError("Please select at least one CV file");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setJobRecommendations([]);

    try {
      setSuccess("🔄 Initializing recommendation system...");
      await initializeSystem();

      setSuccess("📤 Uploading and analyzing CVs...");
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("cvFiles", file.originFileObj || file);
      });

      const response = await fetch(`${API_BASE}/complete-flow/upload-cv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const combinedRecommendations = result.data.jobRecommendations || [];
        setJobRecommendations(combinedRecommendations);
        setSuccess(
          `✅ Success! Found ${combinedRecommendations.length} job recommendations for ${fileList.length} CVs`
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
    fileList,
    onRemove: (file) => {
      setFileList(fileList.filter((f) => f.uid !== file.uid));
    },
    accept: ".pdf,.doc,.docx",
    multiple: true,
    showUploadList: {
      showRemoveIcon: true,
    },
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <Title level={2} className="text-center mb-4">
          📄 Upload Your CVs
        </Title>
        <Paragraph className="text-center text-gray-600 mb-6">
          Upload one or more CVs to get personalized job recommendations powered by AI
        </Paragraph>

        {/* File Upload Area */}
        <Upload
          {...uploadProps}
          className="flex justify-center flex-col items-center mb-6"
          listType="picture"
        >
          <Button
            icon={<UploadOutlined />}
            size="large"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Select CV Files
          </Button>
        </Upload>
        {fileList.length > 0 && (
          <div className="text-center mt-4">
            <Paragraph>
              {fileList.length} file(s) selected
            </Paragraph>
            <List
              dataSource={fileList}
              renderItem={(file) => (
                <List.Item>
                  <Paragraph>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Paragraph>
                </List.Item>
              )}
            />
          </div>
        )}
        {!fileList.length && (
          <div className="text-center mt-4 text-gray-500">
            <Paragraph>Supported formats: PDF, DOC, DOCX</Paragraph>
            <Paragraph>Maximum size: 10MB per file</Paragraph>
          </div>
        )}

        {/* Upload Button */}
        <div className="text-center mt-6">
          <Button
            type="primary"
            size="large"
            onClick={uploadCV}
            disabled={fileList.length === 0 || isUploading}
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
        {!isUploading && jobRecommendations.length === 0 && fileList.length > 0 && (
          <Alert
            message="No job recommendations found. Try uploading different CVs or ensure your CVs contain relevant skills and experience."
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
